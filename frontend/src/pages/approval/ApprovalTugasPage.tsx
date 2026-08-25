import React, { useState } from 'react';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import type { AjuanSuratTugas } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { extractDocxContent } from '@/utils/documentScanner';
import {
  FileText, CheckCircle2, XCircle, Clock, Download,
  MapPin, Calendar as CalendarIcon, Users, Upload, X, Search
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ApprovalTugasPage = () => {
  const { user } = useAuth();
  const [localData, setLocalData] = useState<AjuanSuratTugas[]>(() => {
    const saved = localStorage.getItem('sim_penugasan_tugas');
    return saved ? JSON.parse(saved) : dummyAjuanSuratTugas;
  });

  React.useEffect(() => {
    localStorage.setItem('sim_penugasan_tugas', JSON.stringify(localData));
  }, [localData]);

  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);

  // States for Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [previewDocName, setPreviewDocName] = useState<string>('');

  const handlePreviewSimulation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      setPreviewHtml('');
      try {
        const html = await extractDocxContent(e.target.files[0]);
        setPreviewHtml(html);
      } catch (_error) {
        setPreviewHtml('<p class="text-red-500">Gagal mengekstrak dokumen.</p>');
      } finally {
        setIsScanning(false);
      }
    }
  };

  const openPreview = (tugasId: string, tugasTitle: string) => {
    const savedHtml = localStorage.getItem(`doc_html_${tugasId}`);
    const savedName = localStorage.getItem(`doc_name_${tugasId}`);
    
    if (savedHtml) {
      setPreviewDocName(`(Dari Admin) ${savedName || tugasTitle}`);
      setPreviewHtml(savedHtml);
    } else {
      setPreviewDocName(tugasTitle);
      setPreviewHtml('<div class="p-6 text-center"><p class="text-slate-500 italic mb-2">Dokumen untuk tugas ini belum diunggah oleh Admin.</p><p class="text-xs text-slate-400">Silakan gunakan fitur simulasi di atas untuk mencoba preview dengan file lokal.</p></div>');
    }
    setPreviewModalOpen(true);
  };

  // Ambil hanya data surat yang sesuai dengan "jalur" (Unit Kerja) user approval yang sedang login
  const myUnitData = localData.filter(t => t.unitKerja === user?.unitKerja);

  const pendingApprovals = myUnitData.filter(
    t => t.status === 'DRAFT' || t.status === 'VERIFIKASI_SUBBAGIAN' || t.status === 'PERSETUJUAN_PIMPINAN'
  );

  const displayData = pendingApprovals;

  // Group data by Month and Year
  const groupedData = displayData.reduce((acc, curr) => {
    const dateObj = new Date(curr.tanggalMulai);
    const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(curr);
    return acc;
  }, {} as Record<string, typeof displayData>);

  const sortedGroups = Object.keys(groupedData).sort((a, b) => {
    // Sort descending by date (parse "Agustus 2026" back or just rely on original date if possible, but for simplicity string sort might not work for months. Let's create a date from 1st of month to sort properly)
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dateA = new Date(parseInt(yearA), months.indexOf(monthA), 1);
    const dateB = new Date(parseInt(yearB), months.indexOf(monthB), 1);
    return dateB.getTime() - dateA.getTime();
  });

  const handleApprove = (id: string) => {
    setLocalData(prev => prev.map(item => item.id === id ? { ...item, status: 'SURAT_TERBIT' } : item));
  };

  const handleConfirmApprove = (id: string) => {
    Swal.fire({
      title: 'Konfirmasi Persetujuan',
      text: 'Apakah terdapat perubahan pada dokumen surat tugas ini sebelum disetujui?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Ya, Ada Perubahan (Upload)',
      confirmButtonColor: '#3b82f6',
      denyButtonText: 'Tidak, Langsung Setujui',
      denyButtonColor: '#10b981',
      cancelButtonText: 'Batal',
      cancelButtonColor: '#94a3b8',
    }).then((result) => {
      if (result.isConfirmed) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';
        input.onchange = () => {
          handleApprove(id);
          Swal.fire('Berhasil!', 'File surat perubahan berhasil diunggah. Surat disetujui!', 'success');
        };
        input.click();
      } else if (result.isDenied) {
        handleApprove(id);
        Swal.fire('Disetujui!', `Surat Tugas ${id} berhasil disetujui.`, 'success');
      }
    });
  };

  const handleReject = (id: string) => {
    Swal.fire({
      title: 'Tolak Surat Tugas',
      text: `Anda yakin ingin menolak Surat Tugas ${id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Tolak'
    }).then((result) => {
      if (result.isConfirmed) {
        setLocalData(prev => prev.map(item => item.id === id ? { ...item, status: 'DITOLAK' } : item));
        Swal.fire('Ditolak!', `Surat Tugas ${id} telah ditolak.`, 'error');
      }
    });
  };

  const handleDownloadWord = async (_id: string, nomorSurat: string) => {
    Swal.fire({
      title: 'Mengunduh Surat Tugas',
      text: `Surat ${nomorSurat} sedang diunduh dalam format Word (.docx)...`,
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(`http://localhost:3000/api/tugas/${_id}/download-word`);
      if (!response.ok) throw new Error('Gagal mengunduh');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_Tugas_${nomorSurat.replace(/\//g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      Swal.fire({
        title: 'Berhasil!',
        text: `Surat ${nomorSurat} berhasil diunduh.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat mengunduh surat. Pastikan backend sudah berjalan.',
        icon: 'error',
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Persetujuan Surat Tugas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tinjau dan proses pengajuan surat tugas dari unit kerja Anda.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="p-4">Informasi Surat</th>
                <th className="p-4">Pegawai Ditugaskan</th>
                <th className="p-4">Pelaksanaan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedGroups.length > 0 ? (
                sortedGroups.map((groupMonth) => (
                  <React.Fragment key={groupMonth}>
                    <tr className="bg-slate-100/80">
                      <td colSpan={5} className="py-2 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {groupMonth}
                      </td>
                    </tr>
                    {groupedData[groupMonth].map((tugas) => (
                      <tr key={tugas.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0">
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800 text-sm">{tugas.nomorSurat}</span>
                            <span className="text-slate-600 text-xs line-clamp-2" title={tugas.perihal}>
                              {tugas.perihal}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                              <FileText className="w-3 h-3" />
                              <span>Oleh: {tugas.pengaju.nama} ({tugas.unitKerja})</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{tugas.pegawaiDitugaskan.length} Orang</span>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden">
                              {tugas.pegawaiDitugaskan.slice(0, 3).map((peg, idx) => (
                                <img
                                  key={idx}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 object-cover"
                                  src={peg.fotoAvatar || `https://ui-avatars.com/api/?name=${peg.nama}&background=random`}
                                  alt={peg.nama}
                                  title={peg.nama}
                                />
                              ))}
                              {tugas.pegawaiDitugaskan.length > 3 && (
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-medium text-slate-600">
                                  +{tugas.pegawaiDitugaskan.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-2 text-xs text-slate-600">
                            <div className="flex items-start gap-1.5">
                              <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>
                                {tugas.tanggalMulai} <br />s/d {tugas.tanggalSelesai}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="line-clamp-2">{tugas.lokasiPenugasan}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {tugas.status === 'DRAFT' || tugas.status === 'VERIFIKASI_SUBBAGIAN' || tugas.status === 'PERSETUJUAN_PIMPINAN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200/60">
                              <Clock className="w-3.5 h-3.5" />
                              Perlu Review
                            </span>
                          ) : tugas.status === 'SURAT_TERBIT' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Disetujui
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200/60">
                              <XCircle className="w-3.5 h-3.5" />
                              Ditolak
                            </span>
                          )}
                        </td>
                        <td className="p-4 align-top text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDownloadWord(tugas.id, tugas.nomorSurat)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Download format Word"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openPreview(tugas.id, tugas.nomorSurat)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Scan/Preview Dokumen Word"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button
                              onClick={() => handleConfirmApprove(tugas.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors font-medium"
                              title="Setujui"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(tugas.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Belum ada surat tugas yang menunggu persetujuan Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmApproveId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Konfirmasi Persetujuan
              </h3>
              <button
                onClick={() => setConfirmApproveId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600">
              Apakah terdapat perubahan pada dokumen surat tugas ini sebelum disetujui?
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf'; // HANYA PDF
                  input.onchange = () => {
                    handleApprove(confirmApproveId);
                    setConfirmApproveId(null);
                    Swal.fire({
                      title: 'Berhasil!',
                      text: 'File PDF yang ditandatangani berhasil diunggah. Surat telah disetujui!',
                      icon: 'success',
                      confirmButtonText: 'Selesai',
                      confirmButtonColor: '#10b981'
                    });
                  };
                  input.click();
                }}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                Unggah PDF TTD & Setujui
              </button>

              <button
                onClick={() => {
                  handleApprove(confirmApproveId);
                  setConfirmApproveId(null);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Setujui Tanpa PDF (Hanya Demo)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Preview Dokumen Word</h3>
                <p className="text-sm text-slate-500">{previewDocName}</p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-100/50">
              {/* Simulator Input untuk Testing Mammoth */}
              <div className="mb-6 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                <label className="block text-sm font-semibold text-blue-800 mb-2">Simulasi File (Upload .docx lokal):</label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handlePreviewSimulation}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                />
              </div>

              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 rounded-full border-4 border-slate-300 border-t-blue-600 animate-spin mb-4"></div>
                  <p className="text-slate-600 font-medium">Mengekstrak teks dokumen...</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-8 min-h-[400px] prose prose-sm max-w-none prose-slate"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                >
                </div>
              )}
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
