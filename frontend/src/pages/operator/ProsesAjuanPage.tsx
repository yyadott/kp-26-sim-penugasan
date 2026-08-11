import { useMemo } from 'react';
import { dummyAjuanSuratTugas, UNIT_COLORS } from '@/data/dummyData';
import { Eye } from 'lucide-react';

export const ProsesAjuanPage = () => {
  const prosesAjuan = useMemo(
    () => dummyAjuanSuratTugas.filter((item) => item.status !== 'DRAFT'),
    []
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Proses Ajuan Penugasan</h1>
            <p className="text-sm text-slate-500">Tabel data ajuan penugasan dengan status dan aksi detail.</p>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{prosesAjuan.length} Ajuan dalam Proses</div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Nomor & Perihal</th>
              <th className="px-4 py-3">Unit Kerja</th>
              <th className="px-4 py-3">Pengaju</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prosesAjuan.map((item) => {
              const unitColor = UNIT_COLORS[item.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 min-w-[320px]">
                    <div className="font-semibold text-slate-900">{item.perihal}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.nomorSurat}</div>
                  </td>
                  <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${unitColor.bg} ${unitColor.text}`}>{item.unitKerja}</span></td>
                  <td className="px-4 py-4">{item.pengaju.nama}</td>
                  <td className="px-4 py-4">{item.lokasiPenugasan}</td>
                  <td className="px-4 py-4 font-semibold">{item.status}</td>
                  <td className="px-4 py-4 text-right">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </button>
                  </td>
                </tr>
              );
            })}
            {prosesAjuan.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Belum ada ajuan dalam proses.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
