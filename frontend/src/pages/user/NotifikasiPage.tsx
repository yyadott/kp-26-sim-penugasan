import { useEffect } from 'react';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { Bell, CheckCircle2, MapPin, Building, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotifikasiPage = () => {
  const { tugasList, refreshTugas } = useSuratTugas();

  useEffect(() => {
    refreshTugas();
  }, []);

  // Ambil surat tugas yang disetujui (SURAT_TERBIT)
  const approvedTasks = tugasList.filter(t => t.status === 'SURAT_TERBIT');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Notifikasi Penugasan</h2>
          <p className="text-sm text-slate-500">Pemberitahuan surat tugas yang telah disetujui dan diterbitkan</p>
        </div>
      </div>

      <div className="space-y-4">
        {approvedTasks.length > 0 ? (
          approvedTasks.map(task => (
            <div key={task.id} className="flex gap-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
              <div className="mt-1">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Surat Tugas Disetujui!</h3>
                  <span className="text-xs font-mono text-slate-500">{task.tanggalMulai}</span>
                </div>
                <p className="text-sm text-slate-600">
                  Surat tugas dengan nomor <span className="font-semibold text-slate-800">{task.nomorSurat}</span> untuk kegiatan <span className="italic">"{task.uraianKegiatan}"</span> telah disetujui.
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {task.unitKerja}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {task.tempat}</span>
                  <span className="flex items-center gap-1"><UserCircle2 className="w-3.5 h-3.5" /> Oleh: {task.pengaju?.nama}</span>
                </div>
                <div className="mt-3">
                  <Link 
                    to="/pegawai/tugas/pengajuan" 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    Lihat Detail Surat
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>Belum ada notifikasi surat tugas yang disetujui.</p>
          </div>
        )}
      </div>
    </div>
  );
};
