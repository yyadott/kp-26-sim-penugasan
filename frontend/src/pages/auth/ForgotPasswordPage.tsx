import React from 'react';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Lupa Password</h2>
        <p className="text-slate-600 mb-6 text-center">
          Fitur ini sedang dalam tahap pengembangan.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};
