import { useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { extractDocxContent } from '@/utils/documentScanner';
import Swal from 'sweetalert2';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import { useAuth } from '@/hooks/useAuth';

export const UploadSuratPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Load drafts for dropdown
  const savedTasks = localStorage.getItem('sim_penugasan_tugas');
  const allTasks = savedTasks ? JSON.parse(savedTasks) : dummyAjuanSuratTugas;
  
  // Hanya tampilkan DRAFT dari unit kerja admin yang sedang login (kecuali Super Admin)
  const draftTasks = allTasks.filter((t: any) => 
    t.status === 'DRAFT' && (user?.role === 'SUPER_ADMIN' || t.unitKerja === user?.unitKerja)
  );

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewHtml('');
    
    if (selectedFile.name.endsWith('.docx')) {
      setIsScanning(true);
      try {
        const html = await extractDocxContent(selectedFile);
        setPreviewHtml(html);
        setPreviewModalOpen(true); // Otomatis buka preview setelah diekstrak
      } catch (error) {
        console.error('Gagal memproses dokumen:', error);
        setPreviewHtml('<p class="text-red-500">Gagal memproses preview dokumen.</p>');
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    if (!taskId) {
      Swal.fire('Error', 'Harap pilih penugasan terlebih dahulu.', 'error');
      return;
    }
    
    // Simpan ke localStorage agar bisa diakses oleh halaman Approval
    if (previewHtml) {
      localStorage.setItem(`doc_html_${taskId}`, previewHtml);
      localStorage.setItem(`doc_name_${taskId}`, file.name);
    }
    
    // Update status di mock database (localStorage)
    const updatedTasks = allTasks.map((t: any) => 
      t.id === taskId ? { ...t, status: 'VERIFIKASI_SUBBAGIAN' } : t
    );
    localStorage.setItem('sim_penugasan_tugas', JSON.stringify(updatedTasks));
    
    Swal.fire({
      title: 'Berhasil!',
      text: `Dokumen ${file.name} berhasil disimpan dan diunggah.`,
      icon: 'success',
      confirmButtonText: 'Selesai',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        setFile(null);
        setPreviewHtml('');
        navigate(-1);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button 
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upload Surat Tugas</h1>
          <p className="text-sm text-slate-500">Unggah dokumen fisik surat tugas yang telah disetujui dan ditandatangani.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => navigate('/admin/tugas/buat')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition cursor-pointer"
        >
          Buat Tugas
        </button>
        <button 
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm transition"
        >
          Upload Tugas
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Informasi Surat</h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Pilih Penugasan Terkait (Draft)</label>
                  <button 
                    onClick={() => {
                      const newTask = {
                        id: `st-dummy-${Date.now()}`,
                        nomorSurat: `ST/${Math.floor(Math.random() * 900) + 100}/${user?.unitKerja}/IX/2026`,
                        uraianKegiatan: 'Tugas Simulasi Tambahan (Otomatis)',
                        pengaju: { nama: user?.nama || 'Admin' },
                        pegawaiDitugaskan: [],
                        unitKerja: user?.unitKerja || 'Kepeg',
                        tanggalMulai: '2026-10-01',
                        tanggalSelesai: '2026-10-02',
                        tempat: 'Lokasi Uji Coba',
                        deskripsi: 'Ini adalah draft yang dibuat secara otomatis untuk keperluan testing.',
                        status: 'DRAFT',
                        workflow: []
                      };
                      const updatedTasks = [...allTasks, newTask];
                      localStorage.setItem('sim_penugasan_tugas', JSON.stringify(updatedTasks));
                      window.location.reload();
                    }}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    + Tambah Draft Dummy
                  </button>
                </div>
                <select 
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
                >
                  <option value="">-- Pilih Penugasan (Draft) --</option>
                  {draftTasks.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nomorSurat} - {t.uraianKegiatan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Tambahan (Opsional)</label>
                <textarea 
                  rows={3} 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
                  placeholder="Tambahkan catatan atau deskripsi jika diperlukan..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Upload Dokumen</h2>
            
            {!file ? (
              <div 
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-200 ease-in-out ${
                  dragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={handleChange}
                  accept=".doc,.docx"
                />
                <div className={`rounded-full bg-white p-4 shadow-sm mb-4 transition-transform duration-200 ${dragActive ? 'scale-110' : ''}`}>
                  <UploadCloud className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-base font-semibold text-slate-700">Klik atau seret file ke area ini</p>
                <p className="mt-1 text-sm text-slate-500">Format yang didukung: DOC, DOCX (Max. 5MB)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white p-2.5 shadow-sm">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">{file.name}</p>
                    <p className="text-xs font-medium text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <button 
                    onClick={() => {
                      setFile(null);
                      setPreviewHtml('');
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Area Preview Dokumen */}
            {isScanning && (
              <div className="mt-4 p-6 border border-slate-200 rounded-xl bg-slate-50 animate-pulse flex flex-col items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-slate-300 border-t-blue-600 animate-spin mb-3"></div>
                <p className="text-sm font-medium text-slate-600">Sedang mengekstrak dokumen...</p>
              </div>
            )}
            
            {previewHtml && !isScanning && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setPreviewModalOpen(true)}
                  className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 border border-blue-200"
                >
                  <Eye className="w-4 h-4" />
                  Buka Preview Dokumen
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Ringkasan Aksi</h2>
            
            <ul className="space-y-4 text-sm text-slate-600 mb-8">
              <li className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 transition-colors ${file ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                <span>Dokumen draft surat tugas dilampirkan (Wajib format Word).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0 bg-slate-300" />
                <span>Pastikan Anda memilih nomor penugasan yang sesuai dari daftar.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0 bg-slate-300" />
                <span>Setelah berhasil diunggah, status tugas akan otomatis berubah menjadi "VERIFIKASI_SUBBAGIAN".</span>
              </li>
            </ul>

            <button 
              disabled={!file}
              onClick={handleSubmit}
              className={`w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                file 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 cursor-pointer' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <UploadCloud className="h-5 w-5" />
              Simpan & Unggah Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && previewHtml && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Preview Dokumen Word</h3>
                <p className="text-sm text-slate-500">{file?.name}</p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-100/50">
              <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-8 min-h-[400px] prose prose-sm max-w-none prose-slate"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              >
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
