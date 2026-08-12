import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, CalendarCheck, FileText, MapPin, PiggyBank, Bell, BarChart3, UserCircle2, LogOut, ShieldCheck } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const normalizedRole = user?.role?.toUpperCase() || 'PEGAWAI';
  const prefix = normalizedRole === 'SUPER_ADMIN' ? '/super-admin' : '/admin';

  const links = [
    { to: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${prefix}/anggota`, label: 'Data Anggota', icon: Users, role: ['SUPER_ADMIN'] },
    { to: `${prefix}/absensi`, label: 'Absensi', icon: CalendarCheck, role: ['SUPER_ADMIN'] },
    { to: `${prefix}/tugas`, label: 'Tugas', icon: FileText },
    { to: `${prefix}/pemetaan`, label: 'Pemetaan', icon: MapPin },
    { to: `${prefix}/simpanan`, label: 'Simpanan', icon: PiggyBank, role: ['SUPER_ADMIN'] },
    { to: `${prefix}/notifikasi`, label: 'Notifikasi', icon: Bell },
    { to: `${prefix}/laporan`, label: 'Laporan', icon: BarChart3, role: ['SUPER_ADMIN'] },
    { to: `${prefix}/profile`, label: 'Profil', icon: UserCircle2 },
  ];

  const filteredLinks = links.filter((link) => {
    if (link.role && !link.role.includes(normalizedRole)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100 lg:flex">
          <Link to={`${prefix}/dashboard`} className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">SIM Penugasan</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {filteredLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold">{user?.nama || 'Administrator'}</p>
            <p className="text-xs text-slate-400">{user?.unitKerja || 'Admin'} • {user?.role || 'SUPER_ADMIN'}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Panel Administrator</p>
                <p className="text-xs text-slate-500">Kelola penugasan, absensi, dan anggota</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {user?.unitKerja || 'Admin'}
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
