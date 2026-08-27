import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  ClipboardList,
  ShieldCheck,
  FileText,
  ChartNoAxesCombined,
  Users
} from 'lucide-react';
import { AdminHeader } from './components/AdminHeader';
import { SuperAdminSidebar } from './components/SuperAdminSidebar';
import { ApprovalSidebar } from './components/ApprovalSidebar';
import { SidebarMenuItem } from './components/SidebarMenuItem';

// ─────────────────────────────────────────────
// AdminLayout (shared shell for Super Admin, Admin, Approval)
// ─────────────────────────────────────────────
interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const normalizedRole = user?.role?.toUpperCase() || 'PEGAWAI';

  const prefix = normalizedRole === 'SUPER_ADMIN' ? '/super-admin' : normalizedRole === 'APPROVAL' ? '/approval' : '/admin';
  const panelLabel = normalizedRole === 'SUPER_ADMIN' ? 'Panel Super Admin' : normalizedRole === 'APPROVAL' ? 'Panel Approval' : 'Panel Admin';

  // Admin Links for Admin Role ONLY
  const adminLinks = [
    { to: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${prefix}/pegawai`, label: 'Pegawai', icon: Users },
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
        { to: `${prefix}/tugas/buat`, label: 'Buat Tugas' }
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
          <AdminHeader isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} prefix={prefix} />

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};
