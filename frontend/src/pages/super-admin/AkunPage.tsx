import { useState, useMemo } from 'react';
import { Search, KeyRound, UserCog, X, Loader2, Power } from 'lucide-react';
import { usePegawai } from '@/hooks/usePegawai';
import { useReferensi } from '@/hooks/useReferensi';
import type { Pegawai } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const AkunPage = () => {
  const { pegawaiList, isLoading, updatePegawai } = usePegawai();
  const { roles } = useReferensi();

  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, akunId: '', akunName: '', isCurrentlyActive: false });

  // Selected Account State
  const [selectedAkun, setSelectedAkun] = useState<Pegawai | null>(null);

  // Form States
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState('');

  const filteredPegawai = useMemo(() => {
    return pegawaiList.filter((pegawai) => {
      if (!searchTerm) return true;
      const lowerTerm = searchTerm.toLowerCase();
      return (
        pegawai.nama.toLowerCase().includes(lowerTerm) ||
        (pegawai.nip && pegawai.nip.toLowerCase().includes(lowerTerm)) ||
        (pegawai.email && pegawai.email.toLowerCase().includes(lowerTerm))
      );
    });
  }, [pegawaiList, searchTerm]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAkun && newPassword) {
      try {
        await updatePegawai(selectedAkun.id, { password: newPassword });
        setIsResetModalOpen(false);
        setNewPassword('');
        alert('Password berhasil direset!');
      } catch (err) {
        alert('Gagal mereset password.');
      }
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAkun && newRoleId) {
      try {
        await updatePegawai(selectedAkun.id, { role_id: parseInt(newRoleId) });
        setIsRoleModalOpen(false);
      } catch (err) {
        alert('Gagal mengubah role.');
      }
    }
  };

  const handleToggleStatus = (akun: Pegawai) => {
    setConfirmDialog({
      isOpen: true,
      akunId: akun.id,
      akunName: akun.nama,
      isCurrentlyActive: akun.is_active !== false,
    });
  };

  const openResetModal = (akun: Pegawai) => {
    setSelectedAkun(akun);
    setNewPassword(akun.nip || ''); // Pre-fill with NIP as default suggestion
    setIsResetModalOpen(true);
  };

  const openRoleModal = (akun: Pegawai) => {
    setSelectedAkun(akun);
    const rId = roles.find(r => r.name === akun.role)?.id || '';
    setNewRoleId(rId.toString());
    setIsRoleModalOpen(true);
  };

  const getRoleColor = (role: string = '') => {
    const r = role.toUpperCase();
    if (r === 'ADMIN') return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    if (r === 'APPROVAL') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (r === 'SUPER ADMIN' || r === 'SUPER_ADMIN') return 'bg-purple-50 text-purple-700 border-purple-100';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Akun</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau dan kelola kredensial login serta role dari seluruh pengguna sistem.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIP, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Pengguna</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Role Akses</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-center w-64">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-400 text-sm mt-2">Memuat data akses...</p>
                  </td>
                </tr>
              ) : filteredPegawai.length > 0 ? (
                filteredPegawai.map((akun) => (
                  <tr key={akun.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{akun.nama}</div>
                      <div className="text-slate-500 font-mono text-[12px] mt-0.5">NIP: {akun.nip || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{akun.email || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getRoleColor(akun.role)}`}>
                        {akun.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {akun.is_active !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button
                          onClick={() => openRoleModal(akun)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors shadow-sm w-full"
                          title="Ubah Role"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          Role
                        </button>
                        <button
                          onClick={() => openResetModal(akun)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors shadow-sm w-full"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleToggleStatus(akun)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border rounded-lg transition-colors shadow-sm w-full ${akun.is_active === false ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
                          title={akun.is_active === false ? "Aktifkan" : "Nonaktifkan"}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {akun.is_active === false ? 'Aktifkan' : 'Nonaktif'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Tidak ada data akun ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Reset Password */}
      {isResetModalOpen && selectedAkun && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Reset Password</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetSubmit} className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">
                  Atur ulang password untuk pengguna <strong>{selectedAkun.nama}</strong>.
                </p>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
                <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Masukkan password baru" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                <p className="text-[11px] text-slate-500 mt-1.5">* Default disarankan menggunakan NIP.</p>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Perbarui Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Role */}
      {isRoleModalOpen && selectedAkun && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Ubah Role Akses</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">
                  Pilih level akses baru untuk pengguna <strong>{selectedAkun.nama}</strong>.
                </p>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Level Akses</label>
                <select required value={newRoleId} onChange={e => setNewRoleId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                  <option value="">Pilih Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog for Status */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.isCurrentlyActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        message={`Apakah Anda yakin ingin ${confirmDialog.isCurrentlyActive ? 'menonaktifkan' : 'mengaktifkan kembali'} akun ${confirmDialog.akunName}?`}
        confirmText={confirmDialog.isCurrentlyActive ? 'Nonaktifkan' : 'Aktifkan'}
        type={confirmDialog.isCurrentlyActive ? 'danger' : 'success'}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={async () => {
          if (confirmDialog.akunId) {
            try {
              await updatePegawai(confirmDialog.akunId, { is_active: !confirmDialog.isCurrentlyActive });
              setConfirmDialog({ ...confirmDialog, isOpen: false });
            } catch (err) {
              alert('Gagal mengubah status akun.');
            }
          }
        }}
      />
    </div>
  );
};
