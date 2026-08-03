import { formatDate } from '@/utils/formatter';
import { useAuth } from '@/hooks/useAuth';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import {
  dummyLokasiPenugasan,
  dummyAjuanSuratTugas,
  dummyPresensiPegawaiLain,
  dummyPresensiPribadi,
  UNIT_COLORS,
} from '@/data/dummyData';
import { Link } from 'react-router-dom';
import {
  FileText,
  CalendarCheck,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  UserCheck,
  Building,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const todayFormatted = formatDate(new Date().toISOString());

  const activeLocations = dummyLokasiPenugasan.filter((l) => l.status === 'AKTIF');
  const recentAjuan = dummyAjuanSuratTugas.slice(0, 4);
  const recentPresensi = dummyPresensiPegawaiLain.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold backdrop-blur-md border border-blue-400/30">
            <Building className="w-3.5 h-3.5" />
            <span>{user?.unitKerja} • {user?.role}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, <span className="text-blue-400">{user?.nama}</span> 👋
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Sistem Informasi Manajemen Penugasan, Presensi Pegawai, & Visualisasi Pemetaan Lokasi Terpadu.
          </p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right font-mono text-xs sm:text-sm">
          <span className="text-slate-400 block text-[11px] font-sans">Hari ini:</span>
          <span className="font-bold text-white text-base">{todayFormatted}</span>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute right-40 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
      </div>

      {/* 4 Key Executive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penugasan Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-800">{activeLocations.length}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Pegawai On-Site di Lapangan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presensi Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-700">{dummyPresensiPribadi.persentaseKehadiran}%</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-0.5">Tingkat Kehadiran Instansi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft Butuh Approval</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-800">2</span>
            <span className="text-xs text-slate-500 block mt-0.5">Ajuan Tahap Verifikasi</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Tukin</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-indigo-700">
              Rp {(dummyPresensiPribadi.tukin.tunjanganDiterima / 1000000).toFixed(2)} Jt
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">Bulan Juli 2026</span>
          </div>
        </div>
      </div>

      {/* Map Widget Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Visualisasi Pemetaan Lokasi Penugasan Pegawai
            </h3>
            <p className="text-xs text-slate-500">Peta sebaran penugasan pegawai dari unit yang berbeda-beda secara realtime.</p>
          </div>
          <Link
            to="/pemetaan"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            <span>Buka Peta Penuh</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <PenugasanMap locations={dummyLokasiPenugasan} height="h-[380px]" />
      </div>

      {/* Two Column Layout: Recent Assignments & Attendance Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ajuan Surat Tugas Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Proses Ajuan Surat Tugas Terbaru
            </h3>
            <Link to="/tugas" className="text-xs font-semibold text-blue-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {recentAjuan.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-blue-700">{item.nomorSurat}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'SURAT_TERBIT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                      }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{item.perihal}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Unit: {item.unitKerja}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {item.lokasiPenugasan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Presensi Pegawai Hari Ini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Ringkasan Presensi Pegawai Hari Ini
            </h3>
            <Link to="/absensi" className="text-xs font-semibold text-blue-600 hover:underline">
              Lihat Detail
            </Link>
          </div>

          <div className="space-y-3">
            {recentPresensi.map((p) => {
              const unitColor = UNIT_COLORS[p.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };

              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-xs">{p.nama}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${unitColor.bg} ${unitColor.text}`}>
                        {p.unitKerja}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">NIP: {p.nip}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-emerald-700 block">Masuk: {p.jamMasuk}</span>
                    <span className="text-[10px] text-slate-500">{p.lokasiPresensiMasuk}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};