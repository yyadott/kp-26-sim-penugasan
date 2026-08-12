import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export const PokjaPage = () => {
  // Dummy data
  const [pokjas] = useState([
    { id: 1, kode: 'POKJA-01', nama: 'Departemen IT & Infrastruktur' },
    { id: 2, kode: 'POKJA-02', nama: 'Departemen SDM & Keuangan' },
    { id: 3, kode: 'POKJA-03', nama: 'Tim Riset & Pengembangan' },
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data POKJA / Departemen</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data kelompok kerja dan departemen secara terpusat.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all">
          <Plus className="w-4 h-4" />
          Tambah POKJA
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode atau nama departemen..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold w-40">Kode POKJA</th>
                <th className="px-5 py-3.5 font-semibold">Nama Departemen / Kelompok Kerja</th>
                <th className="px-5 py-3.5 font-semibold text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pokjas.map((pokja) => (
                <tr key={pokja.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[13px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      {pokja.kode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{pokja.nama}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors" title="Edit Data">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Hapus Data">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pokjas.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                    Belum ada data POKJA.
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
