import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SidebarMenuItem({ link, currentPath, isSidebarCollapsed }: { link: any; currentPath: string, isSidebarCollapsed: boolean }) {
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
