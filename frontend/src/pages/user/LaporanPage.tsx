import { ChartNoAxesCombined } from 'lucide-react';

export const LaporanPage = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[400px]">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <ChartNoAxesCombined className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Halaman Laporan</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Halaman Laporan untuk melihat statistik dan rekapitulasi data belum sepenuhnya dibuat. Halaman ini siap dikembangkan pada tahap selanjutnya.
        </p>
      </div>
    </div>
  );
};
