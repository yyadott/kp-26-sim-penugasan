import { useAuth } from '@/hooks/useAuth';
import { FileText, CalendarCheck, CheckCircle2 } from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Pegawai</h1>
          <p className="text-sm text-slate-500 mt-1">Selamat datang, {user?.nama || 'Pegawai'}. Berikut ringkasan tugas Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tugas Aktif</p>
            <h3 className="text-2xl font-bold text-slate-800">3</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tugas Selesai (Bulan Ini)</p>
            <h3 className="text-2xl font-bold text-slate-800">12</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Persentase Kehadiran</p>
            <h3 className="text-2xl font-bold text-slate-800">100%</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-64 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Ini adalah halaman dashboard khusus untuk role USER / PEGAWAI.</p>
      </div>
    </div>
  );
};
