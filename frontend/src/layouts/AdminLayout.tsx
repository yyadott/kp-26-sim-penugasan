import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, CalendarCheck, FileText, MapPin, LogOut, ShieldCheck, ChevronDown, CheckCircle2, UserRound, Menu, ClipboardList, ChartNoAxesCombined, KeyRound, Network } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAdministratorMenuOpen, setIsAdministratorMenuOpen] = useState(
    () => location.pathname.includes('/ajuan-pegawai') || location.pathname.includes('/rekap-penugasan'),
  );
  const [isSuperAdminMenuOpen, setIsSuperAdminMenuOpen] = useState(
    () => location.pathname.includes('/akun') || location.pathname.includes('/pokja'),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
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
    { to: `${prefix}/absensi`, label: 'Absensi', icon: CalendarCheck, role: ['SUPER_ADMIN'] },
    { to: `${prefix}/tugas`, label: 'Penugasan', icon: FileText },
    { to: `${prefix}/pemetaan`, label: 'Pemetaan', icon: MapPin },
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white-600">
            <img 
              src={`${import.meta.env.BASE_URL}logo-kemendikdasmen.ico`} 
              alt="Logo" 
              className="h-9 w-9"/>
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

            {normalizedRole === 'SUPER_ADMIN' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuperAdminMenuOpen((isOpen) => !isOpen)}
                  title={isSidebarCollapsed ? 'Superadmin' : undefined}
                  aria-expanded={isSuperAdminMenuOpen}
                  className={`flex w-full items-center gap-3 rounded-xl py-2.5 transition ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    isSuperAdminMenuOpen || location.pathname.includes('/akun') || location.pathname.includes('/pokja')
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left text-sm">Superadmin</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isSuperAdminMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {!isSidebarCollapsed && isSuperAdminMenuOpen && (
                  <div className="mt-1 space-y-1 border-l border-slate-700 pl-4">
                    <NavLink
                      to={`${prefix}/akun`}
                      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <KeyRound className="h-4 w-4 shrink-0" />
                      Akun
                    </NavLink>
                    <NavLink
                      to={`${prefix}/pokja`}
                      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Network className="h-4 w-4 shrink-0" />
                      POKJA
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            {normalizedRole === 'SUPER_ADMIN' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdministratorMenuOpen((isOpen) => !isOpen)}
                  title={isSidebarCollapsed ? 'Administrator' : undefined}
                  aria-expanded={isAdministratorMenuOpen}
                  className={`flex w-full items-center gap-3 rounded-xl py-2.5 transition ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    isAdministratorMenuOpen || location.pathname.includes('/ajuan-pegawai') || location.pathname.includes('/rekap-penugasan')
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left text-sm">Administrator</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAdministratorMenuOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {!isSidebarCollapsed && isAdministratorMenuOpen && (
                  <div className="mt-1 space-y-1 border-l border-slate-700 pl-4">
                    <NavLink
                      to={`${prefix}/ajuan-pegawai`}
                      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <ClipboardList className="h-4 w-4 shrink-0" />
                      Ajuan Pegawai
                    </NavLink>
                    <NavLink
                      to={`${prefix}/rekap-penugasan`}
                      className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <ChartNoAxesCombined className="h-4 w-4 shrink-0" />
                      Rekap Penugasan
                    </NavLink>
                  </div>
                )}
              </div>
            )}

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

              <div className="flex items-center gap-3">
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
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>

      </div>
    </div>
  );
};
