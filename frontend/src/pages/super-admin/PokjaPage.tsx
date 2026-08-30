import { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { usePokja, type Pokja } from '@/hooks/usePokja';

export const PokjaPage = () => {
  const { pokjas, addPokja, updatePokja, deletePokja } = usePokja();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPokja, setEditingPokja] = useState<Pokja | null>(null);
  const [form, setForm] = useState({ kode: '', nama: '' });

  const filteredPokjas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pokjas;
    return pokjas.filter((pokja) => pokja.kode.toLowerCase().includes(query) || pokja.nama.toLowerCase().includes(query));
  }, [pokjas, searchQuery]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPokja(null);
    setForm({ kode: '', nama: '' });
  };

  const openAddForm = () => {
    setEditingPokja(null);
    setForm({ kode: '', nama: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (pokja: Pokja) => {
    setEditingPokja(pokja);
    setForm({ kode: pokja.kode, nama: pokja.nama });
    setIsFormOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const kode = form.kode.trim().toUpperCase();
    const nama = form.nama.trim();
    if (!kode || !nama) return;

    const kodeSudahAda = pokjas.some((pokja) => pokja.kode.toUpperCase() === kode && pokja.id !== editingPokja?.id);
    if (kodeSudahAda) {
      window.alert('Kode POKJA sudah digunakan.');
      return;
    }

    if (editingPokja) {
      updatePokja(editingPokja.id, kode, nama);
    } else {
      addPokja(kode, nama);
    }
    closeForm();
  };

  const handleDelete = (pokja: Pokja) => {
    if (!window.confirm(`Hapus ${pokja.kode} — ${pokja.nama}?`)) return;
    deletePokja(pokja.id);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Data POKJA / Unit Kerja</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data kelompok kerja dan unit kerja secara terpusat.</p>
        </div>
        <button onClick={openAddForm} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow">
          <Plus className="h-4 w-4" />
          Tambah POKJA
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} type="search" placeholder="Cari kode atau nama unit kerja..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
              <tr>
                <th className="w-44 px-5 py-3.5 font-semibold">Kode POKJA</th>
                <th className="px-5 py-3.5 font-semibold">Nama Unit Kerja / Kelompok Kerja</th>
                <th className="w-36 px-5 py-3.5 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPokjas.map((pokja) => (
                <tr key={pokja.id} className="group transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-3.5"><span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[13px] font-semibold text-slate-600">{pokja.kode}</span></td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{pokja.nama}</td>
                  <td className="px-5 py-3.5 text-center"><div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEditForm(pokja)} className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100" title="Edit data POKJA"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(pokja)} className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100" title="Hapus data POKJA"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
              {filteredPokjas.length === 0 && <tr><td colSpan={3} className="px-5 py-10 text-center text-slate-500">Data POKJA tidak ditemukan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h2 className="font-bold text-slate-800">{editingPokja ? 'Edit POKJA' : 'Tambah POKJA'}</h2>
              <button type="button" onClick={closeForm} className="text-slate-400 transition-colors hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-5">
              <label className="block text-sm font-semibold text-slate-700">Kode POKJA<input required value={form.kode} onChange={(event) => setForm((current) => ({ ...current, kode: event.target.value }))} placeholder="Contoh: POKJA-04" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
              <label className="block text-sm font-semibold text-slate-700">Nama Unit Kerja / Kelompok Kerja<input required value={form.nama} onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))} placeholder="Masukkan nama POKJA" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={closeForm} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button><button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">{editingPokja ? 'Simpan Perubahan' : 'Tambah POKJA'}</button></div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
