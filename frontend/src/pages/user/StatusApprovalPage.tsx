import { useState } from 'react';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { useAuth } from '@/hooks/useAuth';
import { FileText, CheckCircle2, X, Hourglass, CalendarDays, MapPin } from 'lucide-react';

export const StatusApprovalPage = () => {
  const { user } = useAuth();
  const { tugasList } = useSuratTugas();

  const [filterBulan, setFilterBulan] = useState<string>('');
  const [filterTahun, setFilterTahun] = useState<string>('');

  const filteredHistory = tugasList.filter((item) => {
    const itemDate = new Date(item.tanggalMulai);
    const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
    const itemYear = itemDate.getFullYear().toString();

    const matchesBulan = filterBulan === '' || filterBulan === itemMonth;
    const matchesTahun = filterTahun === '' || filterTahun === itemYear;

    return matchesBulan && matchesTahun;
  });

  const getStatusBadge = (status: string) => {
    const statusIsApproved = status === 'SURAT_TERBIT' || status === 'SELESAI';
    const statusIsRejected = status === 'DITOLAK';
    const label = status === 'SELESAI' ? 'Selesai' : status === 'SURAT_TERBIT' ? 'Surat Terbit' : statusIsRejected ? 'Dibatalkan' : 'Diproses';
    const classes = statusIsApproved
      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      : statusIsRejected
        ? 'bg-rose-100 text-rose-800 border border-rose-300'
        : 'bg-slate-100 text-slate-700 border border-slate-300';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${classes}`}>
        {statusIsApproved ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : statusIsRejected ? (
          <X className="w-3.5 h-3.5" />
        ) : (
          <Hourglass className="w-3.5 h-3.5" />
        )}
        {label}
      </span>
    );
  };

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return '-';
    const [tahun, bulan, hari] = tanggal.split('-');
    return `${hari}/${bulan}/${tahun}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Riwayat Penugasan</h1>
            <p className="text-sm text-slate-500">Lihat semua riwayat surat tugas Anda berdasarkan bulan dan tahun.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          >
            <option value="">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          >
            <option value="">Semua Tahun</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Status & Nomor Surat</th>
                <th className="px-6 py-4">Perihal Penugasan</th>
                <th className="px-6 py-4">Tanggal Penugasan</th>
                <th className="px-6 py-4">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex flex-col items-start gap-2">
                        {getStatusBadge(item.status)}
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.nomorSurat}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{item.perihal}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.deskripsi}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                        <CalendarDays className="w-4 h-4 text-blue-500" />
                        {formatTanggal(item.tanggalMulai)} {item.tanggalMulai !== item.tanggalSelesai ? `- ${formatTanggal(item.tanggalSelesai)}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 text-xs text-slate-700">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="block text-slate-800">{item.lokasiSpesifik || '-'}</strong>
                          <span className="text-slate-500">{item.lokasiPenugasan}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <FileText className="w-12 h-12 stroke-1" />
                      <p className="text-sm font-medium">Tidak ada riwayat penugasan pada bulan dan tahun ini.</p>
                    </div>
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
