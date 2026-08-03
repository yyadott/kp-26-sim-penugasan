import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Captcha } from '@/components/ui/captcha';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, allow instant navigation
  React.useEffect(() => {
    if (isAuthenticated && !successMsg) {
      // do not auto redirect immediately if user just reached page to re-login, but can navigate
    }
  }, [isAuthenticated, successMsg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Validasi Input dasar
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan Username atau NIP Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan Password Anda.');
      return;
    }
    if (!userCaptcha.trim()) {
      setErrorMsg('Silakan masukkan kode CAPTCHA keamanan.');
      return;
    }

    // 2. Validasi CAPTCHA (case insensitive)
    if (userCaptcha.trim().toLowerCase() !== generatedCaptcha.toLowerCase()) {
      setErrorMsg('Kode CAPTCHA tidak cocok! Silakan coba lagi.');
      return;
    }

    // 3. Proses Login
    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg('Otentikasi Berhasil! Mengalihkan ke Dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Gagal login. Periksa kembali kredensial Anda.');
      }
    }, 600);
  };

  const fillDemoAccount = () => {
    setUsername('taryadi');
    setPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header Branding */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-3 ring-1 ring-white/20 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-blue-300" />
          </div>
          <h2 className="text-xl font-black tracking-tight">SIM-PENUGASAN</h2>
          <p className="text-xs text-blue-200 font-medium mt-0.5">
            Sistem Informasi Penugasan & Presensi Pemda
          </p>
        </div>

        {/* Card Body / Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800">Masuk ke Akun Anda</h3>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan NIP atau Username terdaftar untuk mengakses sistem.
            </p>
          </div>

          {/* Banner Messages */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / NIP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username atau NIP"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Field Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field CAPTCHA Security */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  Verifikasi Keamanan (CAPTCHA)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <Captcha onCaptchaChange={setGeneratedCaptcha} />

                <div>
                  <input
                    type="text"
                    value={userCaptcha}
                    onChange={(e) => setUserCaptcha(e.target.value)}
                    placeholder="Ketik kode di samping"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-mono tracking-wider transition-all"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 mb-2">Menguji aplikasi secara cepat?</p>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Isi Otomatis Kredensial Demo (Taryadi)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
