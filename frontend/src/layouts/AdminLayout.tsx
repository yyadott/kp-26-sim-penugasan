import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, CalendarCheck, FileText, MapPin, PiggyBank, Bell, BarChart3, UserCircle2, LogOut, ShieldCheck, ChevronDown, CheckCircle2, UserRound, Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <aside className={`hidden flex-col border-r border-slate-200 bg-slate-950 py-6 text-slate-100 lg:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20 px-2' : 'w-72 px-5'}`}>
          <Link to={`${prefix}/dashboard`} className={`flex items-center gap-3 py-2 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-semibold">SIM Penugasan</p>
                <p className="text-xs text-slate-400">Panel Super Admin</p>
              </div>
            )}
          </Link>

          <nav className="mt-8 space-y-1">
            {filteredLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={isSidebarCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl py-2.5 transition ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && <span className="overflow-hidden whitespace-nowrap text-sm">{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Profile block removed from here */}
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hidden lg:block"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 pr-3 hover:bg-slate-50 transition"
                >
                  <div className="relative">
                    <img
                      src={user?.fotoAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{user?.nama || 'Administrator'}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="flex items-center gap-3 pb-4">
                      <img
                        src={user?.fotoAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
                        alt="Avatar"
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{user?.nama || 'Administrator'}</p>
                        <p className="text-xs font-mono text-slate-500">NIP. {user?.nip || '0000000000'}</p>
                        <div className="mt-1 flex w-max items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          <CheckCircle2 className="h-3 w-3" />
                          {user?.role?.replace('_', ' ') || 'SUPER ADMIN'}
                        </div>
                      </div>
                    </div>

                    <hr className="my-2 border-slate-100" />

                    <Link
                      to={`${prefix}/profile`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <UserRound className="h-5 w-5 text-slate-400" />
                      Profil Saya
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Keluar (Logout)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>

      </div>
    </div>
  );
};
