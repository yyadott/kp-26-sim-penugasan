import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
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
            `flex items-center gap-2 rounded-lg py-2 text-[13px] transition ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
            } ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <link.icon className="h-[18px] w-[18px] shrink-0" />
          {!isSidebarCollapsed && <span className="overflow-hidden whitespace-nowrap">{link.label}</span>}
        </NavLink>
      ))}
    </>
  );
}
