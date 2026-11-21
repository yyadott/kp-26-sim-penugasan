import { useAuth } from '@/hooks/useAuth';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { Bell, CheckCircle, Clock, AlertTriangle, XCircle, FileText } from 'lucide-react';

export const NotificationList = () => {
  const { user } = useAuth();
  const { tugasList } = useSuratTugas();

  const notifications: Array<{ id: string; title: string; message: string; date: string; type: 'success' | 'error' | 'warning' | 'info'; link: string; }> = [];

  tugasList.forEach((tugas) => {
    if (user?.role === 'SUPER_ADMIN') {
      if (tugas.status === 'VERIFIKASI_SUBBAGIAN') {
        notifications.push({
          id: `${tugas.id}-verif`,
          title: 'Tugas Menunggu Verifikasi',
          message: `Surat tugas "${tugas.uraianKegiatan}" diajukan dan menunggu verifikasi admin.`,
          date: tugas.workflow.find(w => w.stage === 'DRAFT')?.tanggal || 'Baru saja',
          type: 'info',
          link: '/super-admin/tugas'
        });
      } else if (tugas.status === 'PERSETUJUAN_PIMPINAN') {
        notifications.push({
          id: `${tugas.id}-setuju`,
          title: 'Tugas Menunggu Persetujuan',
          message: `Surat tugas "${tugas.uraianKegiatan}" telah diverifikasi dan menunggu persetujuan pimpinan.`,
          date: tugas.workflow.find(w => w.stage === 'VERIFIKASI_SUBBAGIAN')?.tanggal || 'Baru saja',
          type: 'warning',
          link: '/super-admin/tugas'
        });
      } else if (tugas.status === 'SURAT_TERBIT') {
        notifications.push({
          id: `${tugas.id}-terbit`,
          title: 'Surat Tugas Terbit',
          message: `Surat tugas "${tugas.uraianKegiatan}" telah diterbitkan.`,
          date: tugas.workflow.find(w => w.stage === 'SURAT_TERBIT')?.tanggal || 'Baru saja',
          type: 'success',
          link: '/super-admin/tugas'
        });
      } else if (tugas.status === 'DITOLAK') {
        notifications.push({
          id: `${tugas.id}-tolak`,
          title: 'Surat Tugas Ditolak',
          message: `Surat tugas "${tugas.uraianKegiatan}" telah ditolak.`,
          date: tugas.workflow.find(w => w.status === 'REJECTED')?.tanggal || 'Baru saja',
          type: 'error',
          link: '/super-admin/tugas'
        });
      }
    } 
    else if (user?.role === 'ADMIN') {
      if (user?.unitKerja && (user.unitKerja as string) !== 'Semua Unit' && (tugas.unitKerja as string) !== (user.unitKerja as string)) {
         return; 
      }
      if (tugas.status === 'VERIFIKASI_SUBBAGIAN') {
        notifications.push({
          id: `${tugas.id}-verif`,
          title: 'Verifikasi Dibutuhkan',
          message: `Surat tugas "${tugas.uraianKegiatan}" menunggu verifikasi Anda.`,
          date: tugas.workflow.find(w => w.stage === 'DRAFT')?.tanggal || 'Baru saja',
          type: 'warning',
          link: '/admin/tugas'
        });
      } else if (tugas.status === 'SURAT_TERBIT') {
        notifications.push({
          id: `${tugas.id}-terbit`,
          title: 'Surat Tugas Terbit',
          message: `Surat tugas "${tugas.uraianKegiatan}" dari unit Anda telah diterbitkan.`,
          date: tugas.workflow.find(w => w.stage === 'SURAT_TERBIT')?.tanggal || 'Baru saja',
          type: 'success',
          link: '/admin/tugas'
        });
      } else if (tugas.status === 'DITOLAK') {
        notifications.push({
          id: `${tugas.id}-tolak`,
          title: 'Surat Tugas Ditolak',
          message: `Surat tugas "${tugas.uraianKegiatan}" dari unit Anda ditolak oleh pimpinan.`,
          date: tugas.workflow.find(w => w.status === 'REJECTED')?.tanggal || 'Baru saja',
          type: 'error',
          link: '/admin/tugas'
        });
      }
    }
    else if (user?.role === 'APPROVAL') {
      if (user?.unitKerja && (user.unitKerja as string) !== 'Semua Unit' && (tugas.unitKerja as string) !== (user.unitKerja as string)) {
         return; 
      }
      if (tugas.status === 'PERSETUJUAN_PIMPINAN') {
        notifications.push({
          id: `${tugas.id}-setuju`,
          title: 'Persetujuan Dibutuhkan',
          message: `Surat tugas "${tugas.uraianKegiatan}" menunggu persetujuan Anda.`,
          date: tugas.workflow.find(w => w.stage === 'VERIFIKASI_SUBBAGIAN')?.tanggal || 'Baru saja',
          type: 'warning',
          link: '/approval/tugas'
        });
      }
    }
    else if (user?.role === 'PEGAWAI') {
      const isPengaju = String(tugas.pengaju?.id) === String(user?.id);
      const isAssigned = tugas.pegawaiDitugaskan.some(p => String(p.id) === String(user?.id));

      if (isAssigned && tugas.status === 'SURAT_TERBIT') {
        notifications.push({
          id: `${tugas.id}-terbit-assign`,
          title: 'Penugasan Baru',
          message: `Anda ditugaskan untuk: "${tugas.uraianKegiatan}". Surat tugas telah diterbitkan.`,
          date: tugas.workflow.find(w => w.stage === 'SURAT_TERBIT')?.tanggal || 'Baru saja',
          type: 'success',
          link: '/user/tugas'
        });
      }

      if (isPengaju && tugas.status === 'DITOLAK') {
        notifications.push({
          id: `${tugas.id}-tolak-pengaju`,
          title: 'Pengajuan Ditolak',
          message: `Pengajuan tugas "${tugas.uraianKegiatan}" Anda telah ditolak.`,
          date: tugas.workflow.find(w => w.status === 'REJECTED')?.tanggal || 'Baru saja',
          type: 'error',
          link: '/user/tugas'
        });
      } else if (isPengaju && tugas.status === 'SURAT_TERBIT' && !isAssigned) {
        notifications.push({
          id: `${tugas.id}-terbit-pengaju`,
          title: 'Pengajuan Terbit',
          message: `Pengajuan tugas "${tugas.uraianKegiatan}" Anda telah diterbitkan.`,
          date: tugas.workflow.find(w => w.stage === 'SURAT_TERBIT')?.tanggal || 'Baru saja',
          type: 'info',
          link: '/user/tugas'
        });
      }
    }
  });

  notifications.reverse();

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto mt-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
          <Bell className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Belum ada notifikasi</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm mt-2">
          Saat ini tidak ada aktivitas yang memerlukan perhatian Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Notifikasi Anda
            </h2>
            <p className="text-sm text-slate-500 mt-1">Pembaruan aktivitas dan penugasan</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm border border-blue-200">
            {notifications.length} Baru
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {notifications.map((notif) => (
            <a href={notif.link} key={notif.id} className="flex gap-4 p-5 hover:bg-slate-50 transition block">
              <div className="shrink-0 mt-1">
                {notif.type === 'success' && <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>}
                {notif.type === 'warning' && <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>}
                {notif.type === 'error' && <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center"><XCircle className="w-5 h-5 text-rose-600" /></div>}
                {notif.type === 'info' && <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-800">{notif.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {notif.date}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
