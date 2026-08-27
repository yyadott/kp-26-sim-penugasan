import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SidebarMenuItem } from './SidebarMenuItem';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChartNoAxesCombined,
  KeyRound,
  Network,
  Users
} from 'lucide-react';

export function SuperAdminSidebar({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) {
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
    { to: `${prefix}/pegawai`, label: 'Pegawai', icon: Users },
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
