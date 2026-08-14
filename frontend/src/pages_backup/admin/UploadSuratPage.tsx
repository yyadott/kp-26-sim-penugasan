import { useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UploadSuratPage = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Informasi Surat</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Penugasan Terkait</label>
                <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors">
                  <option value="">-- Pilih Penugasan (Tugas Disetujui / Draft) --</option>
                  <option value="1">ST/084/RBI/VII/2026 - Integrasi IoT & Network Monitoring</option>
                  <option value="2">ST/092/ULP/VIII/2026 - Koordinasi pelayanan publik</option>
                  <option value="3">ST/105/DISHUB/IX/2026 - Pengawasan lalu lintas</option>
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
                  accept=".pdf,.doc,.docx"
                />
                <div className={`rounded-full bg-white p-4 shadow-sm mb-4 transition-transform duration-200 ${dragActive ? 'scale-110' : ''}`}>
                  <UploadCloud className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-base font-semibold text-slate-700">Klik atau seret file ke area ini</p>
                <p className="mt-1 text-sm text-slate-500">Format yang didukung: PDF, DOC, DOCX (Max. 5MB)</p>
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
                    onClick={() => setFile(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
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
                <span>Dokumen surat tugas wajib dilampirkan (Format PDF atau Word).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0 bg-slate-300" />
                <span>Pastikan Anda memilih nomor penugasan yang sesuai dari daftar.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0 bg-slate-300" />
                <span>Setelah berhasil diunggah, status tugas akan otomatis berubah menjadi "Surat Terbit".</span>
              </li>
            </ul>

            <button 
              disabled={!file}
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
    </div>
  );
};
