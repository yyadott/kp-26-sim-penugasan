import { Link } from 'react-router-dom';
import { CalendarCheck, CalendarPlus, ChevronRight } from 'lucide-react';

export const AbsensiMenuPage = () => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Menu Absensi</p>
      <h2 className="mt-2 text-2xl font-semibold">Pilih layanan yang ingin digunakan</h2>
      <p className="mt-2 text-sm text-slate-300">Catat kehadiran harian atau ajukan izin dan cuti melalui pilihan berikut.</p>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <Link to="/anggota/absensi/kehadiran" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><CalendarCheck className="h-6 w-6" /></div>
        <h3 className="mt-5 text-xl font-semibold text-slate-800">Absensi Kehadiran</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Lakukan absen masuk, absen pulang, dan lihat riwayat presensi Anda.</p>
        <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-700">Buka absensi <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </Link>
      <Link to="/anggota/absensi/cuti" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><CalendarPlus className="h-6 w-6" /></div>
        <h3 className="mt-5 text-xl font-semibold text-slate-800">Izin & Cuti</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Kirim pengajuan izin atau cuti dan pantau status persetujuannya.</p>
        <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-sky-700">Buka pengajuan <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </Link>
    </div>
  </div>
);
