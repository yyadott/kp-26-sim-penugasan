import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, CalendarCheck, FileText, MapPin, PiggyBank, Bell, BarChart3, UserCircle2, LogOut, ShieldCheck, ChevronDown, ChevronRight, ClipboardList } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SidebarMenuItem({ link, currentPath }: { link: any; currentPath: string }) {
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
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
            isActive || isOpen ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            {link.label}
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && (
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

              return (
                <Link
                  key={subItem.to}
                  to={subItem.to}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    childActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
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
      className={({ isActive: navActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          navActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {link.label}
    </NavLink>
  );
}

// Komponen Dropdown Header untuk Notifikasi dan Profil
function HeaderDropdowns({ user, handleLogout }: { user: any, handleLogout: () => void }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div ref={notifRef} className="relative">
        <button 
          onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        {isNotifOpen && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
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

      <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
      
      <div ref={profileRef} className="relative">
        <div 
          onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="hidden md:block text-right group-hover:opacity-80 transition-opacity">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.nama || 'Administrator'}</p>
            <p className="text-[11px] text-slate-500 mt-1">{user?.unitKerja || 'Admin'} • {user?.role || 'Admin'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-700 overflow-hidden group-hover:ring-2 group-hover:ring-blue-300 transition-all">
            {user?.fotoAvatar ? (
              <img src={user.fotoAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-6 h-6" />
            )}
          </div>
        </div>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 md:hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.nama || 'Administrator'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@example.com'}</p>
            </div>
            <div className="py-2">
              <Link to="/admin/profil" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                <UserCircle2 className="w-4 h-4" /> Profil Saya
              </Link>
              <Link to="/admin/pengaturan" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                <ShieldCheck className="w-4 h-4" /> Pengaturan Akun
              </Link>
            </div>
            <div className="py-2 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    { to: `${prefix}/ajuan-pegawai`, label: 'Ajuan Pegawai', icon: FileText },
    { 
      to: '#', 
      label: 'Penugasan', 
      icon: ClipboardList,
      items: [
        { to: `${prefix}/tugas?tab=rekap`, label: 'Rekap Penugasan' },
        { to: `${prefix}/tugas?tab=pegawai`, label: 'Pegawai Penugasan' },
        { to: `${prefix}/tugas?tab=laporan`, label: 'Laporan Penugasan' },
        { to: `${prefix}/tugas?tab=periode`, label: 'Periode Penugasan' },
        { to: `${prefix}/tugas?tab=pivot`, label: 'Pivot Penugasan' },
        { to: `${prefix}/tugas?tab=berlangsung`, label: 'Penugasan Berlangsung' },
        { to: `${prefix}/tugas?tab=draft`, label: 'Draft Penugasan' },
        { to: `${prefix}/tugas?tab=blokir`, label: 'Blokir Penugasan' },
      ]
    },
    { to: `${prefix}/pemetaan`, label: 'Pemetaan', icon: MapPin },
    { to: `${prefix}/simpanan`, label: 'Simpanan', icon: PiggyBank, role: ['SUPER_ADMIN'] },
    { to: `${prefix}/laporan`, label: 'Laporan', icon: BarChart3, role: ['SUPER_ADMIN'] },
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
            {filteredLinks.map((link) => (
              <SidebarMenuItem key={link.label} link={link} currentPath={location.pathname} />
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

        <div className="flex-1 h-screen overflow-y-auto bg-slate-50/50">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Panel Administrator</p>
                <p className="text-xs text-slate-500">Kelola penugasan, absensi, dan anggota</p>
              </div>
              <div className="flex items-center gap-4 relative">
                <HeaderDropdowns user={user} handleLogout={handleLogout} />
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
