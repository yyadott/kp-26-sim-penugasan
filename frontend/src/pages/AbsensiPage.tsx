import { useState } from 'react';
import {
  dummyPresensiPribadi,
  dummyRiwayatPresensiPribadi,
  dummyPresensiPegawaiLain,
  UNIT_COLORS,
} from '@/data/dummyData';
import {
  CalendarCheck,
  User,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  Search,
  Filter,
  MapPin,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export const AbsensiPage = () => {
  const [activeTab, setActiveTab] = useState<'PRIBADI' | 'PEGAWAI_LAIN'>('PRIBADI');

  // State Simulasi Absen Hari Ini
  const [sudahAbsenMasuk, setSudahAbsenMasuk] = useState(true);
  const [jamMasukSimulasi, setJamMasukSimulasi] = useState('07:28');
  const [sudahAbsenPulang, setSudahAbsenPulang] = useState(false);
  const [jamPulangSimulasi, setJamPulangSimulasi] = useState<string | null>(null);

  // Filter Presensi Pegawai Lain
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Handle Absen Click
  const handleAbsenMasuk = () => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setSudahAbsenMasuk(true);
    setJamMasukSimulasi(timeNow);
  };

  const handleAbsenPulang = () => {
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setSudahAbsenPulang(true);
    setJamPulangSimulasi(timeNow);
  };

  // Filter List Presensi Pegawai Lain
  const filteredPresensiLain = dummyPresensiPegawaiLain.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.includes(searchQuery) ||
      item.lokasiPresensiMasuk.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnit = filterUnit === 'ALL' || item.unitKerja === filterUnit;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesUnit && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Presensi & Tunjangan Kinerja</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Pantau rekap presensi pribadi, kalkulasi potongan Tukin, serta monitoring kalender dan log presensi pegawai instansi.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-200/70 p-1.5 rounded-xl text-sm font-medium w-fit">
          <button
            onClick={() => setActiveTab('PRIBADI')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'PRIBADI' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Presensi Saya (Pribadi)</span>
          </button>
          <button
            onClick={() => setActiveTab('PEGAWAI_LAIN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'PEGAWAI_LAIN' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Presensi Pegawai Lain</span>
          </button>
        </div>
      </div>

      {/* SUB-MENU 1: PRESENSI PRIBADI */}
      {activeTab === 'PRIBADI' && (
        <div className="space-y-6">
          {/* Card Form Action Presensi Hari Ini */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/15 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full text-white backdrop-blur-xs">
                  Status Presensi Hari Ini
                </span>
                <h3 className="text-xl font-extrabold mt-3">Selasa, 30 Juli 2026</h3>
                <p className="text-blue-100 text-xs mt-1">Lokasi Terdeteksi: Pos Pantau Lembang (ST/084)</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl space-y-2 border border-white/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-100">Jam Masuk:</span>
                  <span className="font-mono font-bold text-sm">{sudahAbsenMasuk ? jamMasukSimulasi : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-100">Jam Pulang:</span>
                  <span className="font-mono font-bold text-sm">{sudahAbsenPulang ? jamPulangSimulasi : '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={sudahAbsenMasuk}
                  onClick={handleAbsenMasuk}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${sudahAbsenMasuk
                    ? 'bg-emerald-500/30 text-white border border-emerald-400/40 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{sudahAbsenMasuk ? 'Sudah Masuk' : 'Absen Masuk'}</span>
                </button>

                <button
                  disabled={!sudahAbsenMasuk || sudahAbsenPulang}
                  onClick={handleAbsenPulang}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${sudahAbsenPulang
                    ? 'bg-amber-500/30 text-white border border-amber-400/40 cursor-not-allowed'
                    : sudahAbsenMasuk
                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{sudahAbsenPulang ? 'Sudah Pulang' : 'Absen Pulang'}</span>
                </button>
              </div>
            </div>

            {/* Statistik Quick Summary */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-slate-800">{dummyPresensiPribadi.totalHadir} Hari</span>
                  <p className="text-xs text-slate-500 mt-1">Total Hadir Tepat Waktu</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-slate-800">{dummyPresensiPribadi.totalTerlambat} Hari</span>
                  <p className="text-xs text-slate-500 mt-1">Terlambat Presensi</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-slate-800">{dummyPresensiPribadi.totalIzin} Hari</span>
                  <p className="text-xs text-slate-500 mt-1">Izin / Sakit Resmi</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-indigo-700">{dummyPresensiPribadi.persentaseKehadiran}%</span>
                  <p className="text-xs text-slate-500 mt-1">Tingkat Kehadiran</p>
                </div>
              </div>
            </div>
          </div>

          {/* HITUNGAN TUNJANGAN KINERJA (TUKIN) CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Kalkulasi Hitungan Tunjangan Kinerja (Tukin)
                </h3>
                <p className="text-xs text-slate-500">
                  Rincian tunjangan dasar, pemotongan kedisiplinan presensi, dan estimasi Tukin diterima bulan ini.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 w-fit">
                Periode: {dummyPresensiPribadi.tukin.periodeBulan}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Formula & Summary */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Tunjangan Dasar (100%):</span>
                  <span className="font-mono font-bold text-slate-800">
                    Rp {dummyPresensiPribadi.tukin.tunjanganDasar.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-600 font-medium">
                  <span>Total Potongan ({dummyPresensiPribadi.tukin.totalPotonganPersen}%):</span>
                  <span className="font-mono font-bold">
                    - Rp {dummyPresensiPribadi.tukin.totalPotonganNominal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">Estimasi Tukin Diterima:</span>
                  <span className="font-mono font-extrabold text-base text-emerald-600">
                    Rp {dummyPresensiPribadi.tukin.tunjanganDiterima.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Tabel Rincian Potongan */}
              <div className="md:col-span-2 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700">
                  Rincian Catatan Pemotongan Tukin Bulan Ini:
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Keterangan / Alasan Indisipliner</th>
                      <th className="px-4 py-2 text-right">Potongan (%)</th>
                      <th className="px-4 py-2 text-right">Nominal Potongan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dummyPresensiPribadi.tukin.rincianPotongan.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono text-slate-700">{r.tanggal}</td>
                        <td className="px-4 py-2.5 text-slate-800 font-medium">{r.alasan}</td>
                        <td className="px-4 py-2.5 text-right text-rose-600 font-bold">{r.persenPotongan}%</td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                          - Rp {r.nominalPotongan.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DETAIL RIWAYAT PRESENSI PRIBADI */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Detail Riwayat Presensi Pribadi (Log Harian)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jam Masuk</th>
                    <th className="px-4 py-3">Lokasi Presensi Masuk</th>
                    <th className="px-4 py-3">Jam Keluar</th>
                    <th className="px-4 py-3">Lokasi Presensi Keluar</th>
                    <th className="px-4 py-3">Status & Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dummyRiwayatPresensiPribadi.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{log.tanggal}</td>
                      <td className="px-4 py-3 font-mono text-emerald-700 font-semibold">{log.jamMasuk}</td>
                      <td className="px-4 py-3 text-slate-600">{log.lokasiPresensiMasuk}</td>
                      <td className="px-4 py-3 font-mono text-amber-700 font-semibold">{log.jamKeluar}</td>
                      <td className="px-4 py-3 text-slate-600">{log.lokasiPresensiKeluar}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${log.status === 'HADIR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'IZIN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {log.status}
                        </span>
                        {log.keterangan && <p className="text-[11px] text-slate-500 mt-0.5">{log.keterangan}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: PRESENSI PEGAWAI LAIN */}
      {activeTab === 'PEGAWAI_LAIN' && (
        <div className="space-y-6">
          {/* Top Controls & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, NIP, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Unit Kerja</option>
                  <option value="RBI">RBI</option>
                  <option value="Fastingkom">Fastingkom</option>
                  <option value="Kepeg">Kepeg</option>
                  <option value="PM">PM</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="HADIR">Hadir</option>
                  <option value="TERLAMBAT">Terlambat</option>
                  <option value="IZIN">Izin</option>
                  <option value="ALFA">Alfa</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-800">{filteredPresensiLain.length}</span> data presensi hari ini.
            </div>
          </div>

          {/* KALENDER VISUAL REKAP ABSEN & STATISTIK */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Kalender Presensi */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  Kalender Presensi Juli 2026
                </h4>
                <div className="flex items-center gap-1 text-slate-400">
                  <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Grid Kalender */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
                <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span className="text-rose-500">Sab</span><span className="text-rose-500">Ming</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-xs font-mono">
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isWeekend = (dayNum % 7 === 5 || dayNum % 7 === 6);
                  const isToday = dayNum === 28;
                  const isLateDay = dayNum === 15;

                  return (
                    <div
                      key={dayNum}
                      className={`h-9 rounded-lg flex flex-col items-center justify-center transition-all ${isToday
                        ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                        : isLateDay
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : isWeekend
                            ? 'bg-slate-50 text-slate-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium'
                        }`}
                    >
                      <span>{dayNum}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-around text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Hadir 100%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Terlambat</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Hari Ini</span>
              </div>
            </div>

            {/* Rekap Absen per Unit Kerja */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Rekap Tingkat Kehadiran Presensi per Unit Kerja</h4>
              <div className="space-y-3">
                {[
                  { unit: 'RBI', pct: 98, total: 12 },
                  { unit: 'Fastingkom', pct: 95, total: 24 },
                  { unit: 'Kepeg', pct: 92, total: 18 },
                  { unit: 'PM', pct: 89, total: 30 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.unit} ({item.total} Personel)</span>
                      <span className="text-blue-700 font-bold">{item.pct}% Hadir</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABEL PRESEBSI PEGAWAI LAIN (PERSIS RUJUKAN USER) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Daftar Log Presensi Pegawai Lintas Unit Kerja</h3>
              <span className="text-xs text-slate-400">Update Realtime • 28 Juli 2026</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">No</th>
                    <th className="px-6 py-3">Nama Pegawai & NIP</th>
                    <th className="px-6 py-3">Unit Kerja</th>
                    <th className="px-6 py-3">Jam Masuk</th>
                    <th className="px-6 py-3">Lokasi Presensi Masuk</th>
                    <th className="px-6 py-3">Jam Keluar</th>
                    <th className="px-6 py-3">Lokasi Presensi Keluar</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPresensiLain.map((item, idx) => {
                    const unitColor = UNIT_COLORS[item.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-3">
                          <p className="font-bold text-slate-900">{item.nama}</p>
                          <p className="text-[11px] text-slate-400 font-mono">NIP: {item.nip}</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${unitColor.bg} ${unitColor.text}`}>
                            {item.unitKerja}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono font-semibold text-emerald-700">{item.jamMasuk}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{item.lokasiPresensiMasuk}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono font-semibold text-amber-700">{item.jamKeluar || '-'}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.lokasiPresensiKeluar || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${item.status === 'HADIR'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : item.status === 'TERLAMBAT'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};