import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, LogIn, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dummyPresensiPribadi, dummyRiwayatPresensiPribadi } from '@/data/dummyData';
import type { PresensiItem } from '@/types';

const statusClass: Record<PresensiItem['status'], string> = {
  HADIR: 'bg-emerald-100 text-emerald-700',
  TERLAMBAT: 'bg-amber-100 text-amber-700',
  IZIN: 'bg-sky-100 text-sky-700',
  SAKIT: 'bg-purple-100 text-purple-700',
  ALFA: 'bg-rose-100 text-rose-700',
};

const formatTanggal = (tanggal: string) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'long', year: 'numeric',
}).format(new Date(`${tanggal}T00:00:00`));

const waktuSekarang = () => new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date()).replace('.', ':');

const menitDariWaktu = (waktu?: string) => {
  if (!waktu || waktu === '-') return 0;
  const [jam, menit] = waktu.split(':').map(Number);
  return (jam * 60) + menit;
};

const terlambatMasuk = (waktu?: string) => menitDariWaktu(waktu) > (7 * 60) + 35;
const terlambatPulang = (waktu?: string) => menitDariWaktu(waktu) > (16 * 60) + 15;

export const AbsensiPage = () => {
  const { user } = useAuth();
  const [presensiHariIni, setPresensiHariIni] = useState<PresensiItem | null>(null);
  const [pesanPresensi, setPesanPresensi] = useState('');

  const riwayat = useMemo(() => {
    const milikSaya = user ? dummyRiwayatPresensiPribadi.filter((item) => item.pegawaiId === user.id) : [];
    return presensiHariIni ? [presensiHariIni, ...milikSaya] : milikSaya;
  }, [presensiHariIni, user]);

  const catatPresensi = (tipe: 'MASUK' | 'PULANG') => {
    const waktu = waktuSekarang();
    const tanggal = new Date().toISOString().slice(0, 10);
    const lokasi = 'Lokasi perangkat Anda';

    if (tipe === 'MASUK') {
      if (presensiHariIni) return;
      const terlambat = terlambatMasuk(waktu);
      setPresensiHariIni({
        id: `presensi-${Date.now()}`,
        pegawaiId: user?.id || 'pegawai',
        nama: user?.nama || 'Anggota',
        nip: user?.nip || '-',
        unitKerja: user?.unitKerja |,
        tanggal,
        jamMasuk: waktu,
        lokasiPresensiMasuk: lokasi,
        status: terlambat ? 'TERLAMBAT' : 'HADIR',
        terlambatMenit: terlambat ? menitDariWaktu(waktu) - ((7 * 60) + 20) : undefined,
      });
      setPesanPresensi(terlambat ? `Absen masuk dicatat pukul ${waktu}. Anda melewati batas toleransi 15 menit.` : `Absen masuk berhasil dicatat pukul ${waktu}.`);
      return;
    }

    if (!presensiHariIni) {
      setPesanPresensi('Silakan lakukan absen masuk terlebih dahulu.');
      return;
    }
    if (presensiHariIni.jamKeluar) return;
    setPresensiHariIni({ ...presensiHariIni, jamKeluar: waktu, lokasiPresensiKeluar: lokasi });
    setPesanPresensi(`Absen pulang berhasil dicatat pukul ${waktu}.`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Absensi Anggota</p>
        <h2 className="mt-2 text-2xl font-semibold">Catat kehadiran Anda</h2>
        <p className="mt-2 text-sm text-slate-300">Jadwal masuk 07.20 dan pulang 16.00. Toleransi keterlambatan maksimal 15 menit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CalendarDays className="h-4 w-4 text-blue-600" /> Kehadiran bulan ini</div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{dummyPresensiPribadi.persentaseKehadiran}%</p>
          <p className="mt-1 text-sm text-slate-500">{dummyPresensiPribadi.totalHadir} dari {dummyPresensiPribadi.totalHariKerja} hari kerja</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 className="h-4 w-4 text-emerald-600" /> Absen masuk</div>
          <p className={`mt-3 text-3xl font-semibold ${terlambatMasuk(presensiHariIni?.jamMasuk) ? 'text-rose-600' : 'text-slate-900'}`}>{presensiHariIni?.jamMasuk || '--:--'}</p>
          <p className="mt-1 text-sm text-slate-500">Status hari ini: {presensiHariIni ? (presensiHariIni.status === 'TERLAMBAT' ? 'Terlambat' : 'Hadir') : 'Belum absen'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Presensi hari ini</h3>
          <p className="mt-1 text-sm text-slate-500">{formatTanggal(new Date().toISOString().slice(0, 10))}</p>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800"><Clock3 className="h-4 w-4" /> Masuk 07.20 (batas 07.35) · Pulang 16.00 (batas 16.15)</div>
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3 text-sm text-blue-800"><MapPin className="mt-0.5 h-5 w-5 shrink-0" /><span>Lokasi akan dicatat dari perangkat Anda saat tombol presensi ditekan.</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button type="button" onClick={() => catatPresensi('MASUK')} disabled={Boolean(presensiHariIni)} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"><LogIn className="h-4 w-4" /> Absen Masuk</button>
              <button type="button" onClick={() => catatPresensi('PULANG')} disabled={!presensiHariIni || Boolean(presensiHariIni.jamKeluar)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><LogOut className="h-4 w-4" /> Absen Pulang</button>
            </div>
          </div>
          {pesanPresensi && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{pesanPresensi}</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Riwayat presensi</h3>
          <p className="mt-1 text-sm text-slate-500">Seluruh catatan kehadiran Anda tersedia di sini.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3 font-semibold">Tanggal</th><th className="px-3 py-3 font-semibold">Masuk</th><th className="px-3 py-3 font-semibold">Pulang</th><th className="px-3 py-3 font-semibold">Lokasi</th><th className="px-3 py-3 font-semibold">Status</th></tr></thead>
              <tbody>{riwayat.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="px-3 py-3 font-medium text-slate-800">{formatTanggal(item.tanggal)}</td><td className={`px-3 py-3 font-medium ${terlambatMasuk(item.jamMasuk) ? 'text-rose-600' : 'text-slate-600'}`}>{item.jamMasuk}</td><td className={`px-3 py-3 font-medium ${terlambatPulang(item.jamKeluar) ? 'text-rose-600' : 'text-slate-600'}`}>{item.jamKeluar || '-'}</td><td className="max-w-48 truncate px-3 py-3 text-slate-600" title={item.lokasiPresensiMasuk}>{item.lokasiPresensiMasuk}</td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass[item.status]}`}>{item.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
