import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  MapPin,
  Bell,
  UserCircle2,
  LogOut,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ClipboardList,
  Menu,
  ChartNoAxesCombined,
  KeyRound,
  Network,
  Users,
  CheckSquare,
  History
} from 'lucide-react';

// ─────────────────────────────────────────────
// Sidebar Menu untuk SUPER ADMIN
// ─────────────────────────────────────────────
function SuperAdminSidebar({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) {
  const location = useLocation();
  const prefix = '/super-admin';

  const [isSuperAdminMenuOpen, setIsSuperAdminMenuOpen] = useState(
    () => location.pathname.includes('/akun') || location.pathname.includes('/pokja'),
  );
  const [isAdministratorMenuOpen, setIsAdministratorMenuOpen] = useState(
    () => location.pathname.includes('/ajuan-pegawai') || location.pathname.includes('/rekap-penugasan'),
  );

  const links = [
    { to: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${prefix}/anggota`, label: 'Pegawai', icon: Users },
    { to: `${prefix}/absensi`, label: 'Absensi', icon: CalendarCheck },
    { to: `${prefix}/tugas`, label: 'Penugasan', icon: FileText },
    { to: `${prefix}/pemetaan`, label: 'Pemetaan', icon: MapPin },
  ];

  return (
    <>
      {links.map((link) => (
        <SidebarMenuItem 
          key={link.label} 
          link={link} 
          currentPath={location.pathname} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
      ))}

      {/* Superadmin Section */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsSuperAdminMenuOpen((v) => !v)}
          title={isSidebarCollapsed ? 'Superadmin' : undefined}
          aria-expanded={isSuperAdminMenuOpen}
          className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm transition ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
            } ${isSuperAdminMenuOpen || location.pathname.includes('/akun') || location.pathname.includes('/pokja')
              ? 'bg-slate-800 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <ShieldCheck className="h-5 w-5 shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span className="flex-1 text-left">Superadmin</span>
              {isSuperAdminMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </>
          )}
        </button>
        {!isSidebarCollapsed && isSuperAdminMenuOpen && (
          <div className="mt-1 space-y-1 border-l border-slate-700 pl-4 ml-3">
            <NavLink to={`${prefix}/akun`} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <KeyRound className="h-4 w-4 shrink-0" /> Akun
            </NavLink>
            <NavLink to={`${prefix}/pokja`} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Network className="h-4 w-4 shrink-0" /> POKJA
            </NavLink>
          </div>
        )}
      </div>

      {/* Administrator Section */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsAdministratorMenuOpen((v) => !v)}
          title={isSidebarCollapsed ? 'Administrator' : undefined}
          aria-expanded={isAdministratorMenuOpen}
          className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm transition ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
            } ${isAdministratorMenuOpen || location.pathname.includes('/ajuan-pegawai') || location.pathname.includes('/rekap-penugasan')
              ? 'bg-slate-800 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <ShieldCheck className="h-5 w-5 shrink-0" />
          {!isSidebarCollapsed && (
            <>
              <span className="flex-1 text-left">Administrator</span>
              {isAdministratorMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </>
          )}
        </button>
        {!isSidebarCollapsed && isAdministratorMenuOpen && (
          <div className="mt-1 space-y-1 border-l border-slate-700 pl-4 ml-3">
            <NavLink to={`${prefix}/ajuan-pegawai`} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <FileText className="h-4 w-4 shrink-0" /> Ajuan Pegawai
            </NavLink>
            <NavLink to={`${prefix}/rekap-penugasan`} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <ChartNoAxesCombined className="h-4 w-4 shrink-0" /> Rekap Penugasan
            </NavLink>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Sidebar Menu untuk APPROVAL
// ─────────────────────────────────────────────
function ApprovalSidebar({ isSidebarCollapsed, prefix }: { isSidebarCollapsed: boolean, prefix: string }) {
  const links = [
    { to: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${prefix}/approval-tugas`, label: 'Approval Tugas', icon: CheckSquare },
    { to: `${prefix}/surat-tugas`, label: 'Surat Tugas', icon: FileText },
    { to: `${prefix}/riwayat-approval`, label: 'Riwayat Approval', icon: History },
  ];

  return (
    <>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to.endsWith('/dashboard')}
          title={isSidebarCollapsed ? link.label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl py-2.5 text-sm transition ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
            } ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <link.icon className="h-5 w-5 shrink-0" />
          {!isSidebarCollapsed && <span className="overflow-hidden whitespace-nowrap">{link.label}</span>}
        </NavLink>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────
// SidebarMenuItem untuk mendukung Dropdown di ADMIN
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SidebarMenuItem({ link, currentPath, isSidebarCollapsed }: { link: any; currentPath: string, isSidebarCollapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const Icon = link.icon;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isChildActive = link.items?.some((item: any) => {
    const [basePath, search] = item.to.split('?');
    const searchParams = new URLSearchParams(search || '');
    const targetTab = searchParams.get('tab');
    const currentSearchParams = new URLSearchParams(location.search);
    const currentTab = currentSearchParams.get('tab');
    const isQueryActive = targetTab ? currentTab === targetTab : true;
    const isPathActive = currentPath === basePath || currentPath === basePath + '/';
    return isPathActive && isQueryActive;
  });
  const isActive = currentPath === link.to || isChildActive;

  if (link.items) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={isSidebarCollapsed ? link.label : undefined}
          className={`flex w-full items-center justify-between rounded-xl py-2.5 text-sm transition ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
            } ${isActive || isOpen ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span className="overflow-hidden whitespace-nowrap">{link.label}</span>}
          </div>
          {!isSidebarCollapsed && (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {!isSidebarCollapsed && isOpen && (
          <div className="mt-1 ml-3 flex flex-col space-y-1 border-l border-slate-700 pl-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {link.items.map((subItem: any) => {
              const [basePath, search] = subItem.to.split('?');
              const searchParams = new URLSearchParams(search || '');
              const targetTab = searchParams.get('tab');
              const currentSearchParams = new URLSearchParams(location.search);
              const currentTab = currentSearchParams.get('tab');

              const isQueryActive = targetTab ? currentTab === targetTab : true;
              const isPathActive = currentPath === basePath || currentPath === basePath + '/';
              const childActive = isPathActive && isQueryActive;

              const SubIcon = subItem.icon;
              return (
                <Link
                  key={subItem.to}
                  to={subItem.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${childActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  {SubIcon && <SubIcon className="h-4 w-4 shrink-0" />}
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={link.to}
      end={link.to.endsWith('/dashboard')}
      title={isSidebarCollapsed ? link.label : undefined}
      className={({ isActive: navActive }) =>
        `flex items-center gap-3 rounded-xl py-2.5 text-sm transition ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
        } ${navActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isSidebarCollapsed && <span className="overflow-hidden whitespace-nowrap">{link.label}</span>}
    </NavLink>
  );
}

// ─────────────────────────────────────────────
// AdminLayout (shared shell for Super Admin, Admin, Approval)
// ─────────────────────────────────────────────
interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
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

  const prefix = normalizedRole === 'SUPER_ADMIN' ? '/super-admin' : normalizedRole === 'APPROVAL' ? '/approval' : '/admin';
  const panelLabel = normalizedRole === 'SUPER_ADMIN' ? 'Panel Super Admin' : normalizedRole === 'APPROVAL' ? 'Panel Approval' : 'Panel Admin';

  // Admin Links for Admin Role ONLY
  const adminLinks = [
    { to: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${prefix}/anggota`, label: 'Pegawai', icon: Users },
    { to: `${prefix}/absensi`, label: 'Absensi', icon: CalendarCheck },
    {
      to: '#',
      label: 'Penugasan',
      icon: ClipboardList,
      items: [
        { to: `${prefix}/tugas?tab=rekap`, label: 'Rekap Penugasan' },
        { to: `${prefix}/tugas?tab=laporan`, label: 'Laporan Penugasan' },
        { to: `${prefix}/tugas?tab=pivot`, label: 'Pivot Penugasan' },
        { to: `${prefix}/tugas?tab=berlangsung`, label: 'Penugasan Berlangsung' },
        { to: `${prefix}/tugas?tab=draft`, label: 'Draft Penugasan' },
        { to: `${prefix}/tugas/upload-surat`, label: 'Scan Dokumen' },
      ]
    },
    { to: `${prefix}/pemetaan`, label: 'Pemetaan', icon: MapPin },
    {
      to: '#',
      label: 'Administrator',
      icon: ShieldCheck,
      items: [
        { to: `${prefix}/ajuan-pegawai`, label: 'Ajuan Pegawai', icon: FileText },
        { to: `${prefix}/rekap-penugasan`, label: 'Rekap Penugasan', icon: ChartNoAxesCombined }
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        {/* ====== SIDEBAR ====== */}
        <aside className={`hidden flex-col bg-slate-950 py-6 text-slate-100 lg:flex transition-all duration-300 ${isSidebarCollapsed ? 'w-20 px-2' : 'w-72 px-5'}`}>
          {/* Logo & Title */}
          <Link to={`${prefix}/dashboard`} className={`flex items-center gap-3 py-2 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <img
                src={`${import.meta.env.BASE_URL}logo-kemendikdasmen.ico`}
                alt="Logo"
                className="h-9 w-9"
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-semibold">SIM Penugasan</p>
                <p className="text-xs text-slate-400">{panelLabel}</p>
              </div>
            )}
          </Link>

          {/* Navigation */}
          <nav className="mt-8 space-y-1">
            {normalizedRole === 'SUPER_ADMIN' ? (
              <SuperAdminSidebar isSidebarCollapsed={isSidebarCollapsed} />
            ) : normalizedRole === 'APPROVAL' ? (
              <ApprovalSidebar isSidebarCollapsed={isSidebarCollapsed} prefix={prefix} />
            ) : (
              adminLinks.map((link) => (
                <SidebarMenuItem key={link.label} link={link} currentPath={location.pathname} isSidebarCollapsed={isSidebarCollapsed} />
              ))
            )}
          </nav>
        </aside>

        {/* ====== MAIN CONTENT ====== */}
        <div className="flex-1 h-screen overflow-y-auto bg-slate-50/50">
          {/* Navbar */}
          <header className="sticky top-0 z-40 bg-white">
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              {/* Left: Hamburger */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition hidden lg:block"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Right: Notification + Profile */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Notification Bell */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                    className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                        <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">Tandai semua dibaca</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${i === 0 ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-800 font-medium">Tugas Baru Ditambahkan</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Admin telah menambahkan tugas baru terkait penyusunan laporan bulanan.</p>
                                <p className="text-[10px] font-semibold text-blue-600 mt-1">2 jam yang lalu</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 text-center bg-slate-50 border-t border-slate-100">
                        <button className="text-xs font-semibold text-slate-600 hover:text-blue-600">Lihat Semua Notifikasi</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1 pr-3 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-700 overflow-hidden">
                        {user?.fotoAvatar ? (
                          <img src={user.fotoAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle2 className="w-5 h-5" />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user?.nama || 'Administrator'}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.nama || 'Administrator'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ') || 'Admin'}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={`${prefix}/profile`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <UserCircle2 className="w-4 h-4" />
                          Profil Saya
                        </Link>
                      </div>
                      <div className="py-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Blue accent line at bottom of navbar */}
            <div className="h-0.5 bg-blue-600"></div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
