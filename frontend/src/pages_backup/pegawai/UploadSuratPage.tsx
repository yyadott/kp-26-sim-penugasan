import { useState } from 'react';

export const UploadSuratPage = () => {
  const [tahunAktif, setTahunAktif] = useState('2026');

  return (
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <div className="bg-teal-500 px-4 py-4 text-white">
        <h2 className="text-2xl font-light uppercase tracking-tight"><span className="font-bold">Daftar</span> Progress Ajuan Surat Tugas</h2>
      </div>

      <div className="p-5 pb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-10">
          <label htmlFor="tahun-ajuan" className="min-w-24 text-sm font-semibold text-slate-700">Tahun Aktif</label>
          <select id="tahun-ajuan" value={tahunAktif} onChange={(event) => setTahunAktif(event.target.value)} className="w-full max-w-64 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-teal-500"><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead><tr className="border-b-2 border-slate-200 bg-stone-50 text-left text-xs font-semibold uppercase text-slate-500"><th className="w-16 px-4 py-2 text-center">#</th><th className="px-4 py-2">Info Draft Ajuan Penugasan</th><th className="w-44 px-4 py-2 text-center">Status</th><th className="w-32 px-4 py-2 text-center">Aksi</th></tr></thead>
            <tbody><tr><td colSpan={4} className="px-4 py-1 text-center text-sm text-slate-800">Data tidak ditemukan.</td></tr></tbody>
          </table>
        </div>
      </div>
      <div className="h-5 bg-slate-100" />
    </div>
  );
};
