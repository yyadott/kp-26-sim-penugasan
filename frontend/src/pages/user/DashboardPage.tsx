import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatter';
import { useAuth } from '@/hooks/useAuth';
import { CalendarWidget } from '@/components/ui/CalendarWidget';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { PenugasanCalendar } from '@/components/calendar/PenugasanCalendar';
import { usePemetaanFilter } from '@/hooks/usePemetaanFilter';
import { PemetaanFilterBar } from '@/components/penugasan/PemetaanFilterBar';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import {
  dummyPresensiPegawaiLain,
  dummyPresensiPribadi,
  UNIT_COLORS,
} from '@/data/dummyData';
import type { AjuanSuratTugas } from '@/types';
import { Link } from 'react-router-dom';
import {
  FileText,
  CalendarCheck,
  MapPin,
  Clock,
  ChevronRight,
  UserCheck,
  Building,
  X,
  FileCheck,
  CheckCircle2,
  Map as MapIcon,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { tugasList, refreshTugas } = useSuratTugas();
  const todayFormatted = formatDate(new Date().toISOString());

  useEffect(() => {
    refreshTugas();
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAjuan, setSelectedAjuan] = useState<AjuanSuratTugas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mapViewMode, setMapViewMode] = useState<'peta' | 'kalender'>('peta');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { updateCredentials } = useAuth();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    const result = updateCredentials({ username: user?.username || '', currentPassword, newPassword });
    setPasswordMessage({ type: result.success ? 'success' : 'error', text: result.message || 'Gagal menyimpan.' });
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setIsPasswordModalOpen(false), 2000);
    }
  };

  const {
    filterMode, handleModeChange,
    selectedUnit, setSelectedUnit,
    selectedPegawaiId, setSelectedPegawaiId,
    searchQuery, setSearchQuery,
    filteredLocations,
    allPegawaiInPenugasan,
    mapLocations,
  } = usePemetaanFilter({ forceMode: 'INDIVIDU', initialPegawaiId: user?.id });

  const activeLocations = mapLocations.filter((l) => l.status === 'AKTIF');
  
  const recentAjuan = tugasList.filter((item) => {
    const isRelatedToUser = 
      item.pengaju?.id === user?.id || 
      item.pegawaiDitugaskan.some(p => p.id === user?.id);
    return isRelatedToUser;
  }).slice(0, 8);

  let recentPresensi = dummyPresensiPegawaiLain;
  let displayDateStr = "Hari Ini";

  if (selectedDate) {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    recentPresensi = dummyPresensiPegawaiLain.filter(p => p.tanggal === formattedDate);
    displayDateStr = formatDate(selectedDate.toISOString());
  } else {
    recentPresensi = dummyPresensiPegawaiLain.slice(0, 8);
  }

  const formatLokasiDisplay = (lokasi: string) => {
    const cleaned = lokasi.trim();
    if (!cleaned) return '';
    if (cleaned.toLowerCase().includes('jawa barat')) return cleaned;
    if (
      cleaned.toLowerCase().includes('kota ') ||
      cleaned.toLowerCase().includes('kabupaten ') ||
      cleaned.toLowerCase().includes('kecamatan ')
    ) {
      return `${cleaned}, Jawa Barat`;
    }
    return cleaned;
  };

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
            Selamat Datang, <span className="text-blue-400">{user?.nama}</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Sistem Informasi Manajemen Penugasan, Presensi Pegawai, & Visualisasi Pemetaan Lokasi Terpadu.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20 transition-all shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              Ubah Password
            </button>
          </div>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right font-mono text-xs sm:text-sm">
          <span className="text-slate-400 block text-[11px] font-sans">Hari ini:</span>
          <span className="font-bold text-white text-base">{todayFormatted}</span>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute right-40 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
      </div>

      {/* Executive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

        <div className="hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex-col justify-between">
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
      </div>

      {/* Map Widget Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Sebaran Penugasan Pegawai
            </h3>
            <p className="text-xs text-slate-500">Visualisasi sebaran penugasan pegawai dari unit yang berbeda-beda secara realtime.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
              <button
                onClick={() => setMapViewMode('peta')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${mapViewMode === 'peta' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Peta
              </button>
              <button
                onClick={() => setMapViewMode('kalender')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${mapViewMode === 'kalender' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Kalender
              </button>
            </div>

            <Link
              to="/pemetaan"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Lihat Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <PemetaanFilterBar
          filterMode={filterMode}
          handleModeChange={handleModeChange}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          selectedPegawaiId={selectedPegawaiId}
          setSelectedPegawaiId={setSelectedPegawaiId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          allPegawaiInPenugasan={allPegawaiInPenugasan}
          mapLocations={mapLocations}
          hideModeSelector={true}
        />

        {mapViewMode === 'peta' ? (
          <PenugasanMap
            locations={filteredLocations}
            selectedUnit="ALL"
            height="h-[450px]"
            showBoundary={true}
            defaultCenter={[-2.5, 118]}
            defaultZoom={5}
            autoFitBounds={false}
          />
        ) : (
          <PenugasanCalendar
            locations={filteredLocations}
            height="h-[600px]"
          />
        )}
      </div>

      {/* Stacked Tables Layout: Recent Assignments & Attendance Log */}
      <div className="space-y-6">
      {/* Presensi & Calendar Layout */}
      <div className="grid grid-cols-1 gap-6">
        {/* Ringkasan Presensi Pegawai Hari Ini */}
        <div className="hidden bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Ringkasan Presensi Pegawai {displayDateStr !== "Hari Ini" ? `(${displayDateStr})` : "Hari Ini"}
            </h3>
            <Link to="/absensi" className="text-sm font-semibold text-blue-600 hover:underline">
              Lihat Detail
            </Link>
          </div>

          <div className="overflow-x-auto pb-2">
            {recentPresensi.length > 0 ? (
              <div className="flex gap-4 min-w-max">
                {recentPresensi.map((p) => {
                  const unitColor = UNIT_COLORS[p.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };

                  return (
                    <div key={p.id} className="w-[260px] shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-sm">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">{p.nama}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${unitColor.bg} ${unitColor.text}`}>
                            {p.unitKerja}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">NIP: {p.nip}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="rounded-lg bg-white border border-slate-200 p-2">
                          <div className="text-[11px] font-semibold uppercase text-slate-500">Masuk</div>
                          <div className="font-mono font-bold text-emerald-700">{p.jamMasuk}</div>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 p-2">
                          <div className="text-[11px] font-semibold uppercase text-slate-500">Keluar</div>
                          <div className="font-mono text-slate-700">{p.jamKeluar || '-'}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-sm text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
                Tidak ada data presensi untuk tanggal ini.
              </div>
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="max-w-md mx-auto w-full">
          <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
      </div>

      {/* Ajuan Surat Tugas Terbaru */}
      <div className="w-full bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Info Surat Terbaru
          </h3>
          <Link to="/tugas" className="text-sm font-semibold text-blue-600 hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {recentAjuan.map((item) => {
              const unitColor = UNIT_COLORS[item.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800' };
              const statusIsApproved = item.status === 'SURAT_TERBIT';
              const statusIsRejected = item.status === 'DITOLAK';
              const statusLabel = statusIsApproved ? 'DiApprove' : statusIsRejected ? 'Ditolak' : 'Diproses';
              const statusBadgeClass = statusIsApproved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : statusIsRejected
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedAjuan(item);
                    setIsModalOpen(true);
                  }}
                  className="min-w-[760px] shrink-0 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-left transition hover:border-blue-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs font-bold text-blue-700 whitespace-nowrap">{item.nomorSurat}</span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass}`}>
                      {statusIsApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : statusIsRejected ? (
                        <X className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-base font-semibold text-slate-900 whitespace-nowrap overflow-x-auto">{item.perihal}</h4>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${unitColor.bg} ${unitColor.text}`}>
                      {item.unitKerja}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 whitespace-nowrap">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      {formatLokasiDisplay(item.lokasiPenugasan)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {isModalOpen && selectedAjuan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Detail Ajuan Surat Tugas
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700">{selectedAjuan.nomorSurat}</span>
                <span className="text-xs text-slate-500">{selectedAjuan.unitKerja}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{selectedAjuan.perihal}</h4>
              <p className="text-xs text-slate-600">{selectedAjuan.deskripsi}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">Tanggal Penugasan</div>
                <div className="text-sm font-semibold text-slate-800">{selectedAjuan.tanggalMulai} s/d {selectedAjuan.tanggalSelesai}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">Lokasi</div>
                <div className="text-sm font-semibold text-slate-800">{formatLokasiDisplay(selectedAjuan.lokasiPenugasan)}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-3">Pegawai Ditugaskan</div>
                <div className="space-y-2">
                  {selectedAjuan.pegawaiDitugaskan.map((p) => (
                    <div key={p.id} className="rounded-xl bg-white border border-slate-200 p-3 text-sm font-medium text-slate-800">
                      {p.nama} • {p.jabatan}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-3">Riwayat Workflow</div>
                <div className="space-y-3">
                  {selectedAjuan.workflow.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                      {w.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
                      )}
                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{w.label}</span>
                          <span className="text-slate-400 font-normal">{w.tanggal || 'Menunggu'}</span>
                        </div>
                        <p className="text-xs text-slate-600">Aktor: {w.actor}</p>
                        {w.catatan && <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">{w.catatan}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                Ubah Password
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Password Lama</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'} 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password lama" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 font-mono text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 font-mono text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {passwordMessage && (
                <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${passwordMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {passwordMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}{passwordMessage.text}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
