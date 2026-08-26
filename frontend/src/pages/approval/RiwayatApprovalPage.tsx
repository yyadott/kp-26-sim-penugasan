import { useState, useMemo } from 'react';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, CheckCircle2, XCircle, Eye, Download, 
  MapPin, Calendar as CalendarIcon, Users, X
} from 'lucide-react';
import Swal from 'sweetalert2';

export const RiwayatApprovalPage = () => {
  const { user } = useAuth();
  const currentDate = new Date();
  
  // Set default to current month and year
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState<any[] | null>(null);
  const [selectedSurat, setSelectedSurat] = useState<any | null>(null);

  const myUnitData = dummyAjuanSuratTugas.filter(t => t.unitKerja === user?.unitKerja);

  const displayData = useMemo(() => {
    return myUnitData.filter(t => {
      // Menampilkan history (sudah disetujui / ditolak)
      if (t.status !== 'SURAT_TERBIT' && t.status !== 'DITOLAK') return false;
      
      const dateObj = new Date(t.tanggalMulai);
      return dateObj.getMonth() === selectedMonth && dateObj.getFullYear() === selectedYear;
    });
  }, [myUnitData, selectedMonth, selectedYear]);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  // Generate some years around current year
  const currentY = currentDate.getFullYear();
  const years = [currentY - 2, currentY - 1, currentY, currentY + 1];

  const handleDownloadWord = async (id: string, nomorSurat: string) => {
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
      const response = await fetch(`http://localhost:3001/api/tugas/${id}/download-word`);
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Approval</h1>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat persetujuan surat tugas yang telah Anda proses.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
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
              {displayData.length > 0 ? (
                displayData.map((tugas) => (
                  <tr key={tugas.id} className="hover:bg-slate-50/50 transition-colors group">
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
                      <div 
                        onClick={() => setSelectedPegawaiDetail(tugas.pegawaiDitugaskan)}
                        className="flex flex-col gap-2 p-2 -m-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-100 group/pegawai"
                        title="Klik untuk melihat detail pegawai"
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 group-hover/pegawai:text-blue-700">
                          <Users className="w-4 h-4 text-slate-400 group-hover/pegawai:text-blue-500" />
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
                      {tugas.status === 'SURAT_TERBIT' ? (
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
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedSurat(tugas)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {tugas.status === 'SURAT_TERBIT' && (
                          <button 
                            onClick={() => handleDownloadWord(tugas.id, tugas.nomorSurat)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                            title="Unduh File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center flex-col flex items-center justify-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-slate-500 text-sm font-medium">
                      Tidak ada riwayat persetujuan pada bulan ini.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal Detail Surat Tugas */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Surat Tugas</h3>
                <p className="text-sm text-slate-500">Pratinjau dokumen surat resmi</p>
              </div>
              <button
                onClick={() => setSelectedSurat(null)}
                className="p-2 transition-colors rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 md:p-8">
              {/* Desain Kertas Surat */}
              <div className="max-w-2xl px-8 py-12 mx-auto bg-white border shadow-sm md:px-12 md:py-16 border-slate-200 rounded-xl">
                {/* Kop Surat */}
                <div className="flex flex-col items-center justify-between gap-4 pb-6 mb-6 border-b-4 sm:flex-row border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center shrink-0 w-16 h-20 bg-blue-50 border border-blue-100 rounded-lg shadow-inner sm:w-20 sm:h-24">
                      <img src="/logo-sim.svg" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 opacity-80 mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                      <FileText className="w-10 h-10 text-blue-600 hidden" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg font-bold tracking-wide uppercase sm:text-xl text-slate-800">Pemerintah Kota Pemerintahan</h2>
                      <h3 className="text-base font-semibold tracking-wide uppercase sm:text-lg text-slate-700">Dinas {selectedSurat.unitKerja}</h3>
                      <p className="text-xs text-slate-500 sm:text-sm">Jl. Contoh Alamat No. 123, Kota Pemerintahan, 40123</p>
                    </div>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="mb-8 text-center">
                  <h1 className="text-xl font-bold underline uppercase sm:text-2xl text-slate-800 tracking-tight">Surat Tugas</h1>
                  <p className="mt-1 text-sm font-medium sm:text-base text-slate-600">Nomor: {selectedSurat.nomorSurat}</p>
                </div>

                {/* Isi Surat */}
                <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
                  <p className="text-justify">
                    Berdasarkan pertimbangan dan kebutuhan organisasi, bersama ini kami menugaskan pegawai di bawah ini:
                  </p>

                  <div className="pl-4 border-l-4 border-blue-200 bg-slate-50 p-4 rounded-r-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                      <tbody>
                        {selectedSurat.pegawaiDitugaskan.map((peg: any, index: number) => (
                          <tr key={peg.id} className="border-b last:border-0 border-slate-200">
                            <td className="py-2.5 w-8 align-top font-medium text-slate-600">{index + 1}.</td>
                            <td className="py-2.5">
                              <div className="font-semibold text-slate-800">{peg.nama}</div>
                              <div className="text-slate-500 text-[11px] sm:text-xs">NIP. {peg.nip}</div>
                              <div className="text-slate-600 text-[11px] sm:text-xs mt-0.5">{peg.jabatan}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-justify">
                    Untuk melaksanakan tugas kedinasan dengan rincian sebagai berikut:
                  </p>

                  <table className="w-full text-sm sm:text-base">
                    <tbody>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold w-32 sm:w-40 align-top text-slate-700">Perihal</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top text-justify font-medium text-slate-800">{selectedSurat.perihal}</td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold align-top text-slate-700">Waktu</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top text-slate-800">
                          {selectedSurat.tanggalMulai} <span className="text-slate-400 mx-1">s.d.</span> {selectedSurat.tanggalSelesai}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold align-top text-slate-700">Lokasi</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top">
                          <span className="font-semibold text-slate-800">{selectedSurat.lokasiPenugasan}</span><br/>
                          <span className="text-slate-500 text-sm mt-1 inline-block">{selectedSurat.lokasiSpesifik}</span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4 font-semibold align-top text-slate-700">Keterangan</td>
                        <td className="py-3 px-2 align-top text-slate-500">:</td>
                        <td className="py-3 align-top text-justify text-slate-800">{selectedSurat.deskripsi}</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="text-justify pt-2">
                    Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab. 
                    Setelah selesai melaksanakan tugas, harap segera membuat laporan hasil pelaksanaan tugas.
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="flex justify-end mt-16">
                  <div className="text-center w-56 sm:w-64">
                    <p className="mb-2 text-sm text-slate-600">Ditetapkan di Kota Pemerintahan<br/>Pada tanggal: {selectedSurat.tanggalMulai}</p>
                    <p className="mb-24 font-bold text-slate-800">Kepala Dinas {selectedSurat.unitKerja}</p>
                    
                    <p className="font-bold underline text-slate-800">........................................</p>
                    <p className="text-sm text-slate-600">NIP. ........................................</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end p-4 bg-white border-t border-slate-200 gap-3">
              <button
                onClick={() => handleDownloadWord(selectedSurat.id, selectedSurat.nomorSurat)}
                className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Unduh Dokumen
              </button>
              <button
                onClick={() => setSelectedSurat(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pegawai Detail Modal */}
      {selectedPegawaiDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-800">Daftar Pegawai Ditugaskan</h3>
              </div>
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto bg-slate-50 flex-1">
              <div className="space-y-3">
                {selectedPegawaiDetail.map((peg, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                    <img 
                      src={peg.fotoAvatar || `https://ui-avatars.com/api/?name=${peg.nama}&background=random`} 
                      alt={peg.nama} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate" title={peg.nama}>{peg.nama}</div>
                      <div className="text-slate-500 text-[11px] truncate">NIP. {peg.nip}</div>
                      <div className="text-slate-600 text-[11px] mt-1 font-medium truncate" title={peg.jabatan}>{peg.jabatan}</div>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-lg border border-slate-200 shrink-0">
                      {peg.unitKerja}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                onClick={() => setSelectedPegawaiDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
