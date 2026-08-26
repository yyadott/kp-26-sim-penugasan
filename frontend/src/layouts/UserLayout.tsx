import { useState, useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, FileText, Send, ChartNoAxesCombined, ChevronDown, Bell, UserCircle2, LogOut, ShieldCheck } from 'lucide-react';

interface UserLayoutProps {
  children: ReactNode;
}

const links = [
  { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export const UserLayout = ({ children }: UserLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { setTugasTerbuka(location.pathname.startsWith('/user/tugas')); }, [location.pathname]);
  const [tugasTerbuka, setTugasTerbuka] = useState(location.pathname.startsWith('/user/tugas'));
  const tugasAktif = location.pathname.startsWith('/user/tugas');

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-4 text-slate-700 lg:flex">
          <Link to="/user/dashboard" className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-semibold">SIM Penugasan</p>
              <p className="text-xs text-slate-500">User</p>
            </div>
          </Link>

          <nav className="mt-6 space-y-1">
            {links.slice(0, 1).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              >
                <Icon className="h-[16px] w-[16px]" />
                {label}
              </NavLink>
            ))}

            <div>
              <button
                type="button"
                onClick={() => setTugasTerbuka((terbuka) => !terbuka)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${tugasAktif ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                aria-expanded={tugasTerbuka}
              >
                <FileText className="h-[16px] w-[16px]" />
                <span className="flex-1 text-left">Tugas</span>
                <ChevronDown className={`h-[16px] w-[16px] transition-transform ${tugasTerbuka ? 'rotate-180' : ''}`} />
              </button>
              {tugasTerbuka && (
                <div className="mt-1 space-y-1 border-l border-slate-200 py-1 pl-4 ml-5">
                  <NavLink to="/user/tugas/pengajuan" className={({ isActive }) => `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <Send className="h-3 w-3" /> Proses Ajuan Surat Tugas
                  </NavLink>
                  <NavLink to="/user/tugas/progres" className={({ isActive }) => `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <FileText className="h-3 w-3" /> Progres Surat Tugas
                  </NavLink>
                  <NavLink to="/user/tugas/laporan" className={({ isActive }) => `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <ChartNoAxesCombined className="h-3 w-3" /> Laporan
                  </NavLink>
                  <NavLink to="/user/tugas/progres" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <FileText className="h-3.5 w-3.5" /> Riwayat Tugas
                  </NavLink>
                </div>
              )}
            </div>

            {/* 
            <div>
              <button
                type="button"
                onClick={() => setAbsensiTerbuka((terbuka) => !terbuka)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${absensiAktif ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                aria-expanded={absensiTerbuka}
              >
                <CalendarCheck className="h-[16px] w-[16px]" />
                <span className="flex-1 text-left">Absensi</span>
                <ChevronDown className={`h-[16px] w-[16px] transition-transform ${absensiTerbuka ? 'rotate-180' : ''}`} />
              </button>
              {absensiTerbuka && (
                <div className="mt-1 space-y-1 border-l border-slate-200 py-1 pl-4 ml-5">
                  <NavLink to="/user/absensi/kehadiran" className={({ isActive }) => `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <CalendarDays className="h-3 w-3" /> Absensi Kehadiran
                  </NavLink>
                  <NavLink to="/user/absensi/cuti" className={({ isActive }) => `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition ${isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <CalendarPlus className="h-3 w-3" /> Izin & Cuti
                  </NavLink>
                </div>
              )}
            </div>
            */}

            {links.slice(1).map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              >
                <Icon className="h-[16px] w-[16px]" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold">{user?.nama || 'User'}</p>
            <p className="text-xs text-slate-500">{user?.unitKerja || 'Unit'} • {user?.role || 'PEGAWAI'}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-[16px] w-[16px]" />
              Keluar
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Area User</p>
                <p className="text-xs text-slate-500">Pantau tugas dan aktivitas harian</p>
              </div>
              <div className="flex items-center gap-2">
                <NavLink to="/user/notifikasi" aria-label="Notifikasi" title="Notifikasi" className={({ isActive }) => `relative flex h-9 w-9 items-center justify-center rounded-full transition ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                </NavLink>
                <NavLink to="/user/profile" aria-label="Profil" title="Profil" className={({ isActive }) => `flex h-9 w-9 items-center justify-center rounded-full transition ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                  <UserCircle2 className="h-5 w-5" />
                </NavLink>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
