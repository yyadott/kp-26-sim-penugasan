import { useNavigate } from 'react-router-dom';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Lupa Password</h2>
        <p className="mt-2 text-sm text-slate-500">Hubungi administrator untuk mengatur ulang akses akun Anda.</p>
        <button
          type="button"
          onClick={() => navigate('/auth/login')}
          className="mt-6 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
};
