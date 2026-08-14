import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { dummyAjuanSuratTugas, dummyPresensiPegawaiLain, dummyPresensiPribadi } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';
import { CalendarCheck, ChevronRight, FileText, MapPin, MapPinned } from 'lucide-react';

const bulan = [
  { label: 'JAN', nomor: 0, warna: '#1683f8' }, { label: 'FEB', nomor: 1, warna: '#00a896' },
  { label: 'MAR', nomor: 2, warna: '#f59e0b' }, { label: 'APR', nomor: 3, warna: '#f43f5e' },
  { label: 'MEI', nomor: 4, warna: '#6366f1' }, { label: 'JUN', nomor: 5, warna: '#2563eb' },
  { label: 'JUL', nomor: 6, warna: '#14b8a6' }, { label: 'AGT', nomor: 7, warna: '#d946ef' },
  { label: 'SEP', nomor: 8, warna: '#7c3aed' }, { label: 'OKT', nomor: 9, warna: '#10b981' },
  { label: 'NOV', nomor: 10, warna: '#f97316' }, { label: 'DES', nomor: 11, warna: '#ef4444' },
];

export const DashboardPage = () => {
  const { user } = useAuth();

  const acceptedAssignments = useMemo(() => {
    if (!user) return [];

    return dummyAjuanSuratTugas.filter((item) => {
      const assignedToUser = item.pegawaiDitugaskan.some((pegawai) => pegawai.id === user.id);
      return assignedToUser && item.status === 'SURAT_TERBIT';
    });
  }, [user]);

  const assignmentLocations = useMemo<LokasiPenugasanPegawai[]>(() => {
    return acceptedAssignments.map((item) => ({
      id: `anggota-${item.id}`,
      suratTugasId: item.id,
      nomorSurat: item.nomorSurat,
      perihal: item.perihal,
      pegawai: user || item.pengaju,
      unitKerja: item.unitKerja,
      lokasi: item.lokasiPenugasan,
      namaLokasi: item.lokasiSpesifik || item.lokasiPenugasan,
      alamatLengkap: [item.lokasiSpesifik, item.lokasiPenugasan].filter(Boolean).join(', '),
      koordinat: item.koordinat,
      tanggalMulai: item.tanggalMulai,
      tanggalSelesai: item.tanggalSelesai,
      status: 'AKTIF',
      markerType: 'approvedAjuan',
    }));
  }, [acceptedAssignments, user]);

  const attendanceSummary = useMemo(() => {
    if (!user) return null;
    return dummyPresensiPegawaiLain.find((item) => item.pegawaiId === user.id) || null;
  }, [user]);

  const rekapBulanan = useMemo(() => bulan.map((item) => ({
    ...item,
    total: acceptedAssignments.filter((tugas) => new Date(`${tugas.tanggalMulai}T00:00:00`).getMonth() === item.nomor).length,
  })), [acceptedAssignments]);
  const totalTertinggi = Math.max(5, ...rekapBulanan.map((item) => item.total));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Area Anggota</p>
            <h2 className="mt-2 text-2xl font-semibold">Selamat datang, {user?.nama || 'Anggota'}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Pantau presensi, surat tugas yang diterima, dan peta lokasi penugasan Anda dalam satu tampilan.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <p className="text-slate-300">Kehadiran bulan ini</p>
            <p className="text-xl font-semibold">{dummyPresensiPribadi.persentaseKehadiran}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
            Presensi Hari Ini
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{attendanceSummary ? 'HADIR' : 'BELUM'}</p>
          <p className="mt-1 text-sm text-slate-500">Status pencatatan kehadiran Anda</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <FileText className="h-4 w-4 text-blue-600" />
            Surat Tugas Diterima
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{acceptedAssignments.length}</p>
          <p className="mt-1 text-sm text-slate-500">Penugasan aktif yang sudah resmi diterbitkan</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <MapPin className="h-4 w-4 text-rose-600" />
            Lokasi Penugasan
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{assignmentLocations.length}</p>
          <p className="mt-1 text-sm text-slate-500">Titik lokasi yang tampil di peta</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Rekap Penugasan Tahun 2026</h3>
            <div className="space-y-1 text-right"><span className="block h-0.5 w-4 bg-slate-500" /><span className="block h-0.5 w-4 bg-slate-500" /><span className="block h-0.5 w-4 bg-slate-500" /></div>
          </div>
          <div className="mt-5 grid grid-cols-[28px_1fr] gap-3">
            <div className="flex h-44 flex-col justify-between pb-6 text-right text-[11px] text-slate-500"><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div>
            <div className="relative h-44 border-b border-slate-300">
              <div className="absolute inset-x-0 top-0 h-px bg-slate-200" /><div className="absolute inset-x-0 h-px bg-slate-200" style={{ top: '20%' }} /><div className="absolute inset-x-0 h-px bg-slate-200" style={{ top: '40%' }} /><div className="absolute inset-x-0 h-px bg-slate-200" style={{ top: '60%' }} /><div className="absolute inset-x-0 h-px bg-slate-200" style={{ top: '80%' }} />
              <div className="absolute inset-x-1 bottom-0 flex h-[132px] items-end justify-around gap-1">
                {rekapBulanan.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end"><div title={`${item.label}: ${item.total} penugasan`} className="w-2 max-w-full rounded-t-sm transition-all" style={{ height: item.total ? `${Math.max(8, (item.total / totalTertinggi) * 100)}%` : '2px', backgroundColor: item.warna }} /><span className="mt-2 text-[11px] font-medium" style={{ color: item.warna }}>{item.label}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h3 className="rounded-sm bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Rekap Izin Cuti</h3><a href="/anggota/absensi/cuti" className="rounded bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-sky-700">Detail</a></div>
          <div className="mt-7 flex items-center justify-center gap-10">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#84cc16 0deg 360deg, #e2e8f0 360deg)' }}><div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-xl text-slate-400">100<sup className="text-xs">%</sup></div></div>
            <div className="space-y-5 text-center"><div><p className="text-xl font-medium text-slate-800">18</p><p className="text-sm text-slate-400">Sisa</p></div><div><p className="text-base font-medium text-slate-800">0</p><p className="text-sm text-slate-400">Terpakai</p></div></div>
          </div>
          <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[22px] border-l-[22px] border-b-slate-200 border-l-transparent" />
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-slate-800"><MapPinned className="h-4 w-4 text-blue-600" /> Visualisasi Pemetaan Lokasi Penugasan Pegawai</div>
            <p className="mt-1 text-xs text-slate-500">Peta sebaran penugasan pegawai dari unit yang berbeda-beda secara realtime.</p>
          </div>
          <a href="/anggota/tugas/progres" className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Lihat Detail <ChevronRight className="h-3.5 w-3.5" /></a>
        </div>
        <div className="mt-3"><PenugasanMap locations={assignmentLocations} height="h-[245px]" showBoundary={true} defaultCenter={[-2.5, 118]} defaultZoom={5} autoFitBounds={true} /></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><FileText className="h-4 w-4 text-blue-600" /> Proses Ajuan Surat Tugas Terbaru</div><a href="/anggota/tugas/pengajuan" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Lihat Semua</a></div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {acceptedAssignments.length > 0 ? acceptedAssignments.map((item) => <article key={item.id} className="min-w-[310px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold text-blue-700">{item.nomorSurat}</p><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">DISETUJUI</span></div><p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">{item.perihal}</p><div className="mt-4 flex items-center gap-3 text-xs"><span className="rounded-full bg-violet-100 px-2.5 py-1 font-semibold text-violet-700">{item.unitKerja}</span><span className="flex items-center gap-1 text-slate-500"><MapPin className="h-3.5 w-3.5 text-rose-500" />{item.lokasiPenugasan}</span></div></article>) : <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada proses ajuan surat tugas terbaru.</div>}
        </div>
      </section>
    </div>
  );
};
