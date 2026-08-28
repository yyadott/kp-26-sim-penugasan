import { useState, useRef, type FormEvent } from 'react';
import { CheckCircle2, Eye, EyeOff, Save, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ProfilePage = () => {
  const { user, updateCredentials, updateProfilePicture } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user?.username || 'yadiyudi');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const result = updateCredentials({ username, currentPassword, newPassword });
    setMessage({ type: result.success ? 'success' : 'error', text: result.message || 'Perubahan tidak dapat disimpan.' });
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateProfilePicture(reader.result);
          setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const passwordInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    visible: boolean,
    setVisible: (visible: boolean) => void,
    placeholder: string,
  ) => (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder} className="w-full rounded-2xl border border-[#d9e2f0] bg-[#f7f9fc] py-3.5 pl-4 pr-12 font-mono text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
        <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea2c4] hover:text-blue-600">
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-white">
      <section className="bg-gradient-to-r from-[#1e42e8] to-[#3932d8] px-7 py-6 text-white sm:px-10">
        <h1 className="text-[28px] font-extrabold tracking-tight">Profil Saya</h1>
        <p className="mt-1 text-base font-medium text-blue-50">Informasi akun pengguna Super Admin.</p>
      </section>

      <main className="mx-auto max-w-4xl px-7 py-7 sm:px-10">
        <div className="flex items-center gap-5 border-b border-slate-200 pb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={user?.fotoAvatar || `${import.meta.env.BASE_URL}pp-navbar-2.jpg`} alt={user?.nama || 'Foto profil'} className="h-[88px] w-[88px] rounded-2xl border-2 border-slate-200 object-cover shadow-sm transition group-hover:brightness-75" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white drop-shadow-md" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user?.nama}</h2>
            <p className="mt-1 font-mono text-sm text-[#57709b]">NIP. {user?.nip}</p>
            <p className="mt-1 text-[11px] text-[#758fbc] cursor-pointer hover:text-blue-600" onClick={() => fileInputRef.current?.click()}>Klik foto untuk mengubah</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Nama</label>
              <input readOnly value={user?.nama || ''} className="w-full rounded-2xl border border-[#d9e2f0] bg-[#f7f9fc] px-4 py-3.5 text-base text-slate-800 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">NIP</label>
              <input readOnly value={user?.nip || ''} className="w-full rounded-2xl border border-[#d9e2f0] bg-[#f7f9fc] px-4 py-3.5 font-mono text-sm text-slate-800 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Jabatan</label>
              <input readOnly value={user?.jabatan || ''} className="w-full rounded-2xl border border-[#d9e2f0] bg-[#f7f9fc] px-4 py-3.5 text-base text-slate-800 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Username</label>
              <div className="relative">
                <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-2xl border border-[#d9e2f0] bg-[#f7f9fc] px-4 py-3.5 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>

          {passwordInput('Password Lama', currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword, 'Masukkan password lama')}
          <div>
            {passwordInput('Password Baru', newPassword, setNewPassword, showNewPassword, setShowNewPassword, 'Masukkan password baru')}
            <p className="mt-2 text-xs text-[#758fbc]">Masukkan password baru untuk mengubah password akun.</p>
          </div>

          {message && <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {message.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}{message.text}
          </div>}

          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#1f5eff] px-5 py-3 font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <Save className="h-5 w-5" />Simpan Perubahan
          </button>
        </form>
      </main>
    </div>
  );
};
