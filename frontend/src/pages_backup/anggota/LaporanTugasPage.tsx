import { useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';

export const LaporanTugasPage = () => {
  const [tahun, setTahun] = useState('2025');
  const [bulan, setBulan] = useState('Semua Bulan');
  const [diproses, setDiproses] = useState(false);

  return (
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <div className="border-t-4 border-teal-600 bg-teal-500 px-4 py-3 text-white"><h2 className="text-2xl font-light">Surat Tugas</h2></div>
      <div className="h-9 bg-teal-600" />

      <div className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <p className="min-w-40 px-4 text-sm font-medium text-slate-700">Filter Data</p>
          <select value={tahun} onChange={(event) => setTahun(event.target.value)} className="w-full max-w-40 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"><option>2026</option><option>2025</option><option>2024</option></select>
          <select value={bulan} onChange={(event) => setBulan(event.target.value)} className="w-full max-w-44 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"><option>Semua Bulan</option><option>Januari</option><option>Februari</option><option>Maret</option><option>April</option><option>Mei</option><option>Juni</option><option>Juli</option><option>Agustus</option><option>September</option><option>Oktober</option><option>November</option><option>Desember</option></select>
          <button type="button" onClick={() => setDiproses(true)} className="flex w-fit items-center justify-center gap-2 rounded-sm bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"><Check className="h-4 w-4 stroke-[3]" /> Proses</button>
        </div>
        <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-sm"><thead><tr className="border-b-2 border-slate-200 bg-stone-50 text-xs font-semibold text-slate-500"><th className="px-4 py-2">Jenis</th><th className="px-4 py-2">Kegiatan</th><th className="px-4 py-2">JP</th><th className="px-4 py-2">Aksi</th></tr></thead><tbody><tr><td colSpan={4} className="px-4 py-1 text-center text-sm text-slate-700"><span className="inline-flex items-center gap-1">{diproses && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{diproses ? 'Data tidak ditemukan.' : <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading...</>}</span></td></tr></tbody></table></div>
      </div>
      <div className="h-5 bg-slate-100" />
    </div>
  );
};
