import { useState } from 'react';
import { Search, Edit, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { UNIT_COLORS } from '@/data/dummyData';
import { usePegawai } from '@/hooks/usePegawai';
import { useReferensi } from '@/hooks/useReferensi';
import type { Pegawai } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const PegawaiPage = () => {
  const { pegawaiList, isLoading, createPegawai, updatePegawai, deletePegawai } = usePegawai();
  const { roles, unitKerja } = useReferensi();
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('Semua Unit Kerja');
  const [roleFilter, setRoleFilter] = useState('Semua Role');
  const [jabatanFilter, setJabatanFilter] = useState('Semua Jabatan');
  const [dataLimit, setDataLimit] = useState<number>(0);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, pegawaiId: '', pegawaiName: '' });

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [form, setForm] = useState({
    nama: '',
    nip: '',
    email: '',
    password: '',
    jabatan: '',
    golongan: '',
    pangkat: '',
    unit_kerja_id: '',
    role_id: '',
  });

  // Helper to get color based on role
  const getRoleColor = (role: string = '') => {
    const r = role.toUpperCase();
    if (r === 'ADMIN') return 'bg-amber-100 text-amber-700';
    if (r === 'APPROVAL') return 'bg-blue-100 text-blue-700';
    if (r === 'SUPER ADMIN' || r === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-700';
    return 'bg-emerald-50 text-emerald-600'; // Default Pegawai
  };

  // Dynamically extract unique jabatan from real data
  const jabatanOptions = [...new Set(pegawaiList.map(p => p.jabatan).filter(j => j && j !== '-'))];


  let filteredPegawai = pegawaiList.filter((pegawai) => {
    // Exclude Super Admin from being shown in the table
    if (pegawai.role?.toUpperCase() === 'SUPER ADMIN' || pegawai.role === 'SUPER_ADMIN') {
      return false;
    }

    const matchesSearch =
      pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pegawai.nip || '').includes(searchTerm);
    const matchesUnit = unitFilter === 'Semua Unit Kerja' || pegawai.unitKerja === unitFilter;
    const matchesRole = roleFilter === 'Semua Role' || pegawai.role?.toUpperCase() === roleFilter.toUpperCase();
    const matchesJabatan = jabatanFilter === 'Semua Jabatan' || pegawai.jabatan === jabatanFilter;

    return matchesSearch && matchesUnit && matchesRole && matchesJabatan;
  });

  if (dataLimit > 0) {
    filteredPegawai = filteredPegawai.slice(0, dataLimit);
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Pegawai</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan lihat daftar seluruh pegawai yang terdaftar di sistem.</p>
        </div>
        <button onClick={() => {
          setEditingPegawai(null);
          setForm({ nama: '', nip: '', email: '', password: '', jabatan: '', golongan: '', pangkat: '', unit_kerja_id: '', role_id: '' });
          setIsFormOpen(true);
        }} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow">
          <Plus className="h-4 w-4" />
          Tambah Pegawai
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative min-w-[170px] flex-1 md:flex-none">
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option>Semua Unit Kerja</option>
                {unitKerja.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[150px] flex-1 md:flex-none">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Semua Role">Semua Role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[180px] flex-1 md:flex-none">
              <select
                value={jabatanFilter}
                onChange={(e) => setJabatanFilter(e.target.value)}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Semua Jabatan">Semua Jabatan</option>
                {jabatanOptions.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[120px] flex-1 md:flex-none">
              <select
                value={dataLimit}
                onChange={(e) => setDataLimit(Number(e.target.value))}
                className="w-full appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value={0}>Semua Data</option>
                <option value={10}>10 Data</option>
                <option value={20}>20 Data</option>
                <option value={50}>50 Data</option>
                <option value={100}>100 Data</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 w-16 text-center">No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Pegawai</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Jabatan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Unit Kerja</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-400 text-sm mt-2">Memuat data pegawai...</p>
                  </td>
                </tr>
              ) : filteredPegawai.length > 0 ? (
                filteredPegawai.map((pegawai, index) => {
                  const colorCode = UNIT_COLORS[pegawai.unitKerja];
                  const finalUnitClasses = colorCode ? `${colorCode.bg} ${colorCode.text}` : 'bg-blue-50 text-blue-600';
                  const roleBg = getRoleColor(pegawai.role);
                  const initials = pegawai.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <tr key={pegawai.id} className="hover:bg-slate-50/50 transition-colors group bg-white">
                      <td className="px-6 py-4 text-sm text-slate-500 text-center font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border border-slate-200 shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-[14px]">{pegawai.nama}</div>
                            <div className="text-[13px] text-slate-400 font-medium mt-0.5">NIP. {pegawai.nip}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-600 text-[14px]">{pegawai.jabatan}</div>
                          <div className="text-[13px] text-slate-400 mt-0.5">{pegawai.golongan} — {pegawai.pangkat}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${finalUnitClasses}`}>
                          {pegawai.unitKerja}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${roleBg}`}>
                          {pegawai.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => {
                            setEditingPegawai(pegawai);
                            // Find corresponding unit and role IDs to preset form
                            const uId = unitKerja.find(u => u.name === pegawai.unitKerja)?.id || '';
                            const rId = roles.find(r => r.name === pegawai.role)?.id || '';
                            setForm({
                              nama: pegawai.nama,
                              nip: pegawai.nip || '',
                              email: pegawai.email || '',
                              password: '', // Leave empty when editing
                              jabatan: pegawai.jabatan || '',
                              golongan: pegawai.golongan || '',
                              pangkat: pegawai.pangkat || '',
                              unit_kerja_id: uId.toString(),
                              role_id: rId.toString(),
                            });
                            setIsFormOpen(true);
                          }} className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              pegawaiId: pegawai.id,
                              pegawaiName: pegawai.nama
                            });
                          }} className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100" title="Hapus Pegawai">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data pegawai yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={async (e) => {
            e.preventDefault();
            const payload = {
              nama: form.nama,
              nip: form.nip,
              email: form.email,
              jabatan: form.jabatan,
              golongan: form.golongan,
              pangkat: form.pangkat,
              unit_kerja_id: parseInt(form.unit_kerja_id),
              role_id: parseInt(form.role_id),
            };

            try {
              if (editingPegawai) {
                // Tambahkan password jika diisi
                if (form.password) {
                  (payload as any).password = form.password;
                }
                await updatePegawai(editingPegawai.id, payload);
              } else {
                await createPegawai({ ...payload, password: form.password });
              }
              setIsFormOpen(false);
            } catch (err) {
              alert("Gagal menyimpan data pegawai.");
            }
          }} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h2 className="font-bold text-slate-800">{editingPegawai ? 'Edit Pegawai' : 'Tambah Pegawai'}</h2>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Seksi A: Informasi Kepegawaian */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Informasi Kepegawaian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-slate-700">Nama Lengkap
                    <input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Taryadi, S.Kom." className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">NIP
                    <input value={form.nip} onChange={e => setForm({ ...form, nip: e.target.value })} placeholder="Contoh: 198001012010011001" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Unit Kerja
                    <select required value={form.unit_kerja_id} onChange={e => setForm({ ...form, unit_kerja_id: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white">
                      <option value="">Pilih Unit Kerja</option>
                      {unitKerja.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Jabatan
                    <input value={form.jabatan} onChange={e => setForm({ ...form, jabatan: e.target.value })} placeholder="Contoh: Analis Kebijakan Ahli Muda" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Golongan
                    <input value={form.golongan} onChange={e => setForm({ ...form, golongan: e.target.value })} placeholder="Contoh: III/c" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Pangkat
                    <input value={form.pangkat} onChange={e => setForm({ ...form, pangkat: e.target.value })} placeholder="Contoh: Penata" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                </div>
              </div>

              {/* Seksi B: Kredensial & Akses Akun */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Kredensial & Akses Akun</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-slate-700">Email
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Contoh: taryadi@email.com" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Password
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editingPegawai ? "Kosongkan jika tidak diubah" : "Kosongkan untuk default (NIP)"} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Role Aplikasi
                    <select required value={form.role_id} onChange={e => setForm({ ...form, role_id: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white">
                      <option value="">Pilih Role Akses</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white transition-colors">Batal</button>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                {editingPegawai ? 'Simpan Perubahan' : 'Tambah Pegawai'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Hapus Pegawai"
        message={`Apakah Anda yakin ingin menghapus permanen pegawai bernama ${confirmDialog.pegawaiName}?`}
        confirmText="Hapus Permanen"
        type="danger"
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.pegawaiId) {
            deletePegawai(confirmDialog.pegawaiId);
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }
        }}
      />
    </div>
  );
};
