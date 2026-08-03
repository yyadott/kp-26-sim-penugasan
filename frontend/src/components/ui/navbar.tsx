import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  MapPin,
  ShieldCheck,
  ChevronDown,
  LogOut,
  LogIn,
  User as UserIcon,
  BadgeCheck,
  Building2,
  Lock,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-50">
      {/* Logo & Branding */}
      <div className="flex items-center gap-6 md:gap-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
              SIM-PENUGASAN
            </h1>
            <p className="text-[11px] font-medium text-slate-500">Pemerintah Daerah & Presensi</p>
          </div>
        </Link>

        {/* Menu Navigasi Utama */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${isActive
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tugas"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${isActive
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <FileText className="w-4 h-4" />
            <span>Penugasan</span>
          </NavLink>

          <NavLink
            to="/absensi"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${isActive
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Presensi & Tukin</span>
          </NavLink>

          <NavLink
            to="/pemetaan"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${isActive
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <MapPin className="w-4 h-4" />
            <span>Pemetaan Penugasan</span>
          </NavLink>
        </nav>
      </div>

      {/* Profile & Auth Section */}
      <div className="relative" ref={dropdownRef}>
        {isAuthenticated && user ? (
          /* Profile Dropdown Button saat terotentikasi */
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="relative">
              <img
                src={
                  user.fotoAvatar ||
                  `${import.meta.env.BASE_URL}pp-navbar-2.jpg`
                }
                alt={user.nama}
                className="w-9 h-9 rounded-lg object-cover border border-blue-500/30 shadow-xs group-hover:border-blue-500"
              />

              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                {user.nama}
              </p>
              <p className="text-[11px] font-medium text-slate-500">{user.unitKerja}</p>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''
                }`}
            />
          </button>
        ) : (
          /* Tombol Login saat tidak/belum terotentikasi */
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Sistem</span>
          </Link>
        )}

        {/* Dropdown Menu Modal */}
        {isAuthenticated && user && isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.fotoAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={user.nama}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-blue-500/20 shadow-xs"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{user.nama}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">NIP. {user.nip}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                      <BadgeCheck className="w-3 h-3 text-blue-600" />
                      {user.role || 'PEGAWAI'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Tambahan Profil */}
            <div className="px-4 py-2.5 text-xs text-slate-600 space-y-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.unitKerja}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.jabatan}</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="p-1.5 space-y-1">
              <Link
                to="/login"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors font-medium"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Ganti Akun / Halaman Login</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};