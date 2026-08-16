import { useState, useEffect } from 'react';
import { Plus, Search, KeyRound, UserCog, X } from 'lucide-react';

type Akun = {
  id: number;
  nama: string;
  nip: string;
  username: string;
  level: string;
  password: string;
};

export const AkunPage = () => {
  // Dummy data with localStorage persistence
  const [akuns, setAkuns] = useState<Akun[]>(() => {
    const saved = localStorage.getItem('sim_penugasan_akuns');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, nama: 'Admin Unit A', nip: '198001012005011001', username: 'adminA', level: 'Admin', password: '***' },
      { id: 2, nama: 'User Umum', nip: '199001012015011002', username: 'user1', level: 'User', password: '***' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sim_penugasan_akuns', JSON.stringify(akuns));
  }, [akuns]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  // Selected Account State
  const [selectedAkunId, setSelectedAkunId] = useState<number | null>(null);

  // Form States
  const [newAkun, setNewAkun] = useState({ nama: '', nip: '', username: '', level: 'User', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('User');

  // --- Handlers ---
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAkun.nama || !newAkun.username) return;
    
    setAkuns([
      ...akuns,
      {
        id: Date.now(),
        nama: newAkun.nama,
        nip: newAkun.nip,
        username: newAkun.username,
        level: newAkun.level,
        password: newAkun.password || '***'
      }
    ]);
    setIsAddModalOpen(false);
    setNewAkun({ nama: '', nip: '', username: '', level: 'User', password: '' });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAkunId && newPassword) {
      setAkuns(akuns.map(akun => 
        akun.id === selectedAkunId ? { ...akun, password: newPassword } : akun
      ));
    }
    setIsResetModalOpen(false);
    setNewPassword('');
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAkunId) {
      setAkuns(akuns.map(akun => 
        akun.id === selectedAkunId ? { ...akun, level: newRole } : akun
      ));
    }
    setIsRoleModalOpen(false);
  };

  const openResetModal = (id: number) => {
    setSelectedAkunId(id);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const openRoleModal = (akun: Akun) => {
    setSelectedAkunId(akun.id);
    setNewRole(akun.level);
    setIsRoleModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Akun</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akun untuk Admin tiap unit kerja dan user umum.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          Buat Akun Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIP, atau username..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nama Lengkap</th>
                <th className="px-5 py-3.5 font-semibold">NIP</th>
                <th className="px-5 py-3.5 font-semibold">Username</th>
                <th className="px-5 py-3.5 font-semibold">Password</th>
                <th className="px-5 py-3.5 font-semibold">Level Akun</th>
                <th className="px-5 py-3.5 font-semibold text-center w-64">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {akuns.map((akun) => (
                <tr key={akun.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{akun.nama}</td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono text-[13px]">{akun.nip}</td>
                  <td className="px-5 py-3.5 text-slate-600">{akun.username}</td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-[13px]">{akun.password}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${akun.level === 'Admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {akun.level}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openRoleModal(akun)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors shadow-sm w-full"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        Ubah Role
                      </button>
                      <button 
                        onClick={() => openResetModal(akun.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors shadow-sm w-full"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset Pwd
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {akuns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Belum ada data akun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Akun */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Tambah Akun Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={newAkun.nama} onChange={e => setNewAkun({...newAkun, nama: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                <input type="text" value={newAkun.nip} onChange={e => setNewAkun({...newAkun, nip: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input required type="text" value={newAkun.username} onChange={e => setNewAkun({...newAkun, username: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Level Akses</label>
                <select value={newAkun.level} onChange={e => setNewAkun({...newAkun, level: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                  <option value="User">User Umum</option>
                  <option value="Admin">Admin Unit Kerja</option>
                  <option value="Approval">Approval</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password Awal (Opsional)</label>
                <input type="password" value={newAkun.password} onChange={e => setNewAkun({...newAkun, password: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reset Password */}
      {isResetModalOpen && (
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
                <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Masukkan password baru" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none" />
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
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Ubah Role Akun</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Level Akses</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                  <option value="User">User Umum</option>
                  <option value="Admin">Admin Unit Kerja</option>
                  <option value="Approval">Approval</option>
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

    </div>
  );
};
