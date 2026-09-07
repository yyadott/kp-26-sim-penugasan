import { useState } from 'react';
import { Eye, EyeOff, KeyRound, UserRound, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ProfilePage = () => {
  const { user, getDemoCredentials, updateCredentials } = useAuth();
  const credentials = getDemoCredentials();
  const username = credentials.username;
  const currentPassword = credentials.password;
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState(username);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [message, setMessage] = useState('');

  if (!user) return null;

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!usernameInput.trim() || !emailInput.trim() || !oldPasswordInput.trim() || !passwordInput.trim()) {
      setMessage('Username, email, password lama, dan password baru wajib diisi.');
      return;
    }
    if (oldPasswordInput !== currentPassword) {
      setMessage('Password lama tidak sesuai.');
      return;
    }
    updateCredentials({ username: usernameInput, email: emailInput, currentPassword: oldPasswordInput, newPassword: passwordInput });
    setMessage('Profil berhasil diperbarui!');
    setOldPasswordInput('');
    setPasswordInput('');
    setShowPassword(false);
    setMessage('Perubahan username dan password berhasil disimpan.');
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="mt-1 text-sm text-blue-100">Informasi akun pengguna Super Admin.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5 p-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <img
              src={user.fotoAvatar || `${import.meta.env.BASE_URL}pp-navbar-2.jpg`}
              alt={user.nama}
              className="h-20 w-20 rounded-2xl border-2 border-blue-100 object-cover shadow-sm"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-800">{user.nama}</h2>
              <p className="font-mono text-sm text-slate-500">NIP. {user.nip}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Nama</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
                {/* <UserRound className="h-4 w-4 text-slate-400" /> */}
                <span>{user.nama}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">NIP</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-700">{user.nip}</div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Username</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              <UserRound className="h-4 w-4 text-slate-400" />
              <input value={usernameInput} onChange={(event) => setUsernameInput(event.target.value)} className="w-full bg-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              <input type="email" value={emailInput} onChange={(event) => setEmailInput(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Alamat Email" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Password Lama</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input type={showOldPassword ? 'text' : 'password'} value={oldPasswordInput} onChange={(event) => setOldPasswordInput(event.target.value)} placeholder="Masukkan password lama" className="flex-1 bg-transparent font-mono text-sm text-slate-700 outline-none" />
              <button type="button" onClick={() => setShowOldPassword((visible) => !visible)} className="text-slate-400 hover:text-blue-600" aria-label={showOldPassword ? 'Sembunyikan password lama' : 'Tampilkan password lama'}>
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Password Baru</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} placeholder="Masukkan password baru" className="flex-1 bg-transparent font-mono text-sm text-slate-700 outline-none" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="text-slate-400 hover:text-blue-600" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">Masukkan password baru untuk mengubah password akun.</p>
          </div>
          {message && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">{message}</p>}
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            <Save className="h-4 w-4" /> Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
};
