import { useEffect, useState, type ReactNode } from 'react';
import { BadgeCheck, Building2, CheckCircle2, Mail, Pencil, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ProfilPage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ nama: '', email: '', jabatan: '' });

  useEffect(() => {
    if (user) {
      setForm({ nama: user.nama, email: user.email || '', jabatan: user.jabatan });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    if (!form.nama.trim() || !form.email.trim() || !form.jabatan.trim()) return;
    updateProfile({ nama: form.nama.trim(), email: form.email.trim(), jabatan: form.jabatan.trim() });
    setIsEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const fields = [
    { key: 'nama' as const, label: 'Nama lengkap', icon: UserRound, type: 'text' },
    { key: 'email' as const, label: 'Alamat email', icon: Mail, type: 'email' },
    { key: 'jabatan' as const, label: 'Jabatan', icon: BadgeCheck, type: 'text' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <section className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 22%), radial-gradient(circle at 85% 80%, white 0, transparent 18%)' }} />
        </div>
        <div className="px-5 sm:px-8 pb-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <img src={user.fotoAvatar || `${import.meta.env.BASE_URL}pp-navbar-2.jpg`} alt={user.nama} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-slate-100" />
              <div className="pb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Profil pengguna</p>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.nama}</h1>
                <p className="text-sm text-slate-500">{user.jabatan}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition-colors cursor-pointer">
              <Pencil className="w-4 h-4" /> {isEditing ? 'Batal' : 'Ubah profil'}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard icon={<Building2 className="w-4 h-4" />} label="Unit kerja" value={user.unitKerja} />
            <InfoCard icon={<UserRound className="w-4 h-4" />} label="NIP" value={user.nip} />
            <InfoCard icon={<ShieldCheck className="w-4 h-4" />} label="Hak akses" value={user.role || 'PEGAWAI'} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-slate-900">Informasi akun</h2>
            <p className="text-sm text-slate-500 mt-1">Perbarui informasi yang digunakan pada tampilan sistem.</p>
          </div>
          {saved && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map(({ key, label, icon: Icon, type }) => (
            <label key={key} className={key === 'jabatan' ? 'md:col-span-2' : ''}>
              <span className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-blue-600" />{label}</span>
              <input type={type} value={form[key]} disabled={!isEditing} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 disabled:text-slate-600 disabled:cursor-default disabled:bg-slate-50/70" />
            </label>
          ))}
        </div>
        {isEditing && <div className="mt-6 flex justify-end"><button type="button" onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer"><Save className="w-4 h-4" /> Simpan perubahan</button></div>}
      </section>
    </div>
  );
};

const InfoCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="text-slate-400 mb-1">{icon}</div>
    <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500">{label}</p>
    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
  </div>
);
