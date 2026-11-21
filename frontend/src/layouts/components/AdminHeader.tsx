import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Bell, UserCircle2, ChevronDown, LogOut, FileText, Menu } from 'lucide-react';

export function AdminHeader({ isSidebarCollapsed, setIsSidebarCollapsed, prefix }: { isSidebarCollapsed: boolean, setIsSidebarCollapsed: (v: boolean) => void, prefix: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
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
  );
}
