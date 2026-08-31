import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { ChartNoAxesCombined, UploadCloud, FileText, CheckCircle2, FileUp, Send } from 'lucide-react';

export const LaporanPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { tugasList } = useSuratTugas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTaskId, setSelectedTaskId] = useState(location.state?.selectedTaskId || '');
  const [catatan, setCatatan] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List of uploaded reports for this session/system
  const [reports, setReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('sim_penugasan_laporan');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sim_penugasan_laporan', JSON.stringify(reports));
  }, [reports]);

  // For the user, only show their own reports
  const myReports = reports.filter(r => r.pegawaiId === user?.id);

  const activeTasks = tugasList.filter(t => t.status === 'SURAT_TERBIT');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !selectedFile) {
      alert('Pilih surat tugas dan file laporan terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const task = tugasList.find(t => t.id === selectedTaskId);
      
      const newReport = {
        id: Date.now().toString(),
        taskId: selectedTaskId,
        nomorSurat: task?.nomorSurat || '-',
        perihal: task?.perihal || '-',
        tanggalUpload: new Date().toISOString().split('T')[0],
        fileName: selectedFile.name,
        status: 'TERKIRIM',
        pegawaiId: user?.id || 'unknown',
        pegawaiNama: user?.nama || 'Unknown Pegawai',
        catatan: catatan
      };

      setReports([newReport, ...reports]);
      
      // Reset form
      setSelectedTaskId('');
      setCatatan('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsSubmitting(false);
      
      alert('Laporan berhasil diunggah!');
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
          <ChartNoAxesCombined className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laporan Pelaksanaan Tugas</h1>
          <p className="text-sm text-slate-500">Unggah dokumen laporan hasil pelaksanaan tugas Anda di sini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Upload */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Form Upload Laporan</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Surat Tugas <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                >
                  <option value="">-- Pilih Penugasan --</option>
                  {activeTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.nomorSurat} - {t.perihal}</option>
                  ))}
                </select>
                {activeTasks.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Anda belum memiliki tugas yang disetujui (Surat Terbit).</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan / Ringkasan Hasil (Opsional)</label>
                <textarea 
                  rows={3}
                  placeholder="Ketikkan ringkasan singkat dari pelaksanaan tugas..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">File Dokumen Laporan <span className="text-red-500">*</span></label>
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  
                  {selectedFile ? (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-emerald-700 truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500">Klik untuk mengganti file</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-bold text-blue-600">Klik untuk upload</span> atau drag and drop
                      </div>
                      <p className="text-[10px] text-slate-500">Mendukung file PDF, DOCX (Maks 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !selectedTaskId || !selectedFile}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengunggah...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Laporan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tabel Riwayat Laporan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Riwayat Laporan Terunggah</h2>
                <p className="text-xs text-slate-500">Daftar laporan pelaksanaan tugas yang telah Anda kirim.</p>
              </div>
            </div>
            
            <div className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Surat Tugas</th>
                    <th className="px-5 py-3">File Laporan</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myReports.length > 0 ? (
                    myReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-mono text-[11px] font-bold text-blue-700">{report.nomorSurat}</p>
                          <p className="font-semibold text-slate-800 mt-0.5 line-clamp-1">{report.perihal}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700 max-w-[150px] truncate" title={report.fileName}>
                              {report.fileName}
                            </span>
                          </div>
                          {report.catatan && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">Catatan: {report.catatan}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500">{report.tanggalUpload}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <FileText className="w-10 h-10 stroke-1" />
                          <p className="text-sm font-medium">Belum ada laporan yang diunggah.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
