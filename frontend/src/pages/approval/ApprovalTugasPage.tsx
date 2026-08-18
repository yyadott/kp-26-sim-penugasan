import React, { useState } from 'react';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, CheckCircle2, XCircle, Clock, Eye, Download, 
  MapPin, Calendar as CalendarIcon, Users, Upload, X
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ApprovalTugasPage = () => {
  const { user } = useAuth();
  const [localData, setLocalData] = useState(dummyAjuanSuratTugas);

  // Ambil hanya data surat yang sesuai dengan "jalur" (Unit Kerja) user approval yang sedang login
  const myUnitData = localData.filter(t => t.unitKerja === user?.unitKerja);

  const pendingApprovals = myUnitData.filter(
    t => t.status === 'VERIFIKASI_SUBBAGIAN' || t.status === 'PERSETUJUAN_PIMPINAN'
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

  const handleDownloadWord = (id: string, nomorSurat: string) => {
    Swal.fire({
      title: 'Mengunduh Surat Tugas',
      text: `Surat ${nomorSurat} sedang diunduh dalam format Word (.docx)...`,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
    // Di aplikasi nyata, ini akan memicu download file dari backend
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
                                {tugas.tanggalMulai} <br/>s/d {tugas.tanggalSelesai}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="line-clamp-2">{tugas.lokasiPenugasan}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {tugas.status === 'VERIFIKASI_SUBBAGIAN' || tugas.status === 'PERSETUJUAN_PIMPINAN' ? (
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
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Detail Draft"
                            >
                              <Eye className="w-4 h-4" />
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

    </div>
  );
};
