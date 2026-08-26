import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  History
} from 'lucide-react';

export function ApprovalSidebar({ isSidebarCollapsed, prefix }: { isSidebarCollapsed: boolean, prefix: string }) {
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
