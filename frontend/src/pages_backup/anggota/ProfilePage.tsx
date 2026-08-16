import { useState } from 'react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ProfilePage = () => {
  const { user, updateCredentials } = useAuth();
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [pesan, setPesan] = useState('');
  const [gagal, setGagal] = useState(false);
  const nama = user?.nama || 'Arnest, S.Kom.';

  const simpanPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordBaru !== konfirmasiPassword) {
      setGagal(true);
      setPesan('Konfirmasi password baru belum sama.');
      return;
    }
    const hasil = updateCredentials({ username: user?.username || user?.nip || '', currentPassword: passwordLama, newPassword: passwordBaru });
    setGagal(!hasil.success);
    setPesan(hasil.message || 'Password berhasil diperbarui.');
    if (hasil.success) {
      setPasswordLama('');
      setPasswordBaru('');
      setKonfirmasiPassword('');
    }
  };

  return (
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <div className="border-t-4 border-teal-600 bg-teal-500 px-5 py-4 text-white"><h2 className="text-2xl font-light">Pengaturan Akun Pegawai</h2><div className="mt-3 flex items-center gap-3"><div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white/70 bg-teal-700">{user?.fotoAvatar && <img src={user.fotoAvatar} alt={nama} className="h-full w-full object-cover" />}</div><span className="bg-teal-600 px-3 py-1.5 text-xs font-semibold">{nama}</span></div></div>
      <div className="h-9 bg-teal-600" />

      <div className="p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-[140px_1fr]">
          <div className="mx-auto h-36 w-32 overflow-hidden border-4 border-stone-100 bg-slate-100 md:mx-0">{user?.fotoAvatar ? <img src={user.fotoAvatar} alt={nama} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-500">{nama.charAt(0)}</div>}</div>
          <div>
            <h3 className="border-b border-slate-200 pb-4 text-2xl font-light text-slate-700"><span className="font-bold text-slate-800">Akun</span> Pegawai</h3>
            <form onSubmit={simpanPassword} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Nama<input readOnly value={nama} className="mt-1.5 w-full rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700" /></label>
              <label className="block text-sm font-semibold text-slate-700">User ID<input readOnly value={user?.nip || '-'} className="mt-1.5 w-full rounded-sm border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700" /></label>
              <label className="block max-w-lg text-sm font-semibold text-slate-700">Password lama<input required type="password" value={passwordLama} onChange={(event) => setPasswordLama(event.target.value)} className="mt-1.5 w-full rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500" /></label>
              <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Password baru<input required minLength={6} type="password" value={passwordBaru} onChange={(event) => setPasswordBaru(event.target.value)} className="mt-1.5 w-full rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500" /></label><label className="block text-sm font-semibold text-slate-700">Ketik ulang password baru<input required minLength={6} type="password" value={konfirmasiPassword} onChange={(event) => setKonfirmasiPassword(event.target.value)} className="mt-1.5 w-full rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500" /></label></div>
              <button type="submit" className="flex items-center gap-2 rounded-sm bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"><KeyRound className="h-4 w-4" /> Simpan Password</button>
            </form>
            {pesan && <p className={`mt-4 flex items-center gap-2 text-sm ${gagal ? 'text-rose-600' : 'text-emerald-700'}`}><CheckCircle2 className="h-4 w-4" />{pesan}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
