import { useState } from 'react';
import { formatDate } from '@/utils/formatter';
import { useAuth } from '@/hooks/useAuth';
import { CalendarWidget } from '@/components/ui/CalendarWidget';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { PenugasanCalendar } from '@/components/calendar/PenugasanCalendar';
import {
  getUnitColor,
} from '@/data/dummyData';
import type { AjuanSuratTugas } from '@/types';
import { Link } from 'react-router-dom';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { usePemetaanFilter } from '@/hooks/usePemetaanFilter';
import { usePegawai } from '@/hooks/usePegawai';
import { PemetaanFilterBar } from '@/components/penugasan/PemetaanFilterBar';
import {
  FileText,
  FileCheck,
  CheckCircle2,
  Map as MapIcon,
  Calendar,
  BarChart3,
  ArrowUpRight,
  Building,
  Clock,
  MapPin,
  ChevronRight,
  X,
  Users,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const todayFormatted = formatDate(new Date().toISOString());

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAjuan, setSelectedAjuan] = useState<AjuanSuratTugas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapViewMode, setMapViewMode] = useState<'peta' | 'kalender'>('peta');

  const {
    filterMode, handleModeChange,
    selectedUnit, setSelectedUnit,
    selectedPegawaiId, setSelectedPegawaiId,
    searchQuery, setSearchQuery,
    filteredLocations,
    allPegawaiInPenugasan,
    mapLocations,
  } = usePemetaanFilter();

  const { pegawaiList } = usePegawai();

  const activeLocations = mapLocations.filter((l) => l.status === 'AKTIF');
  const { tugasList } = useSuratTugas();

  // Hitung total orang aktif seperti di halaman Pemetaan
  const totalOrangAktif = (tugasList || [])
    .filter((item: any) => item.status === 'SURAT_TERBIT')
    .reduce((total: number, item: any) => total + (item.pegawaiDitugaskan?.length || 0), 0);

  const recentAjuan = tugasList.slice(0, 8);

  let displayDateStr = "Pilih Tanggal";
  let tugasPadaTanggal: AjuanSuratTugas[] = [];

  const checkHasTask = (date: Date) => {
    const selDate = new Date(date);
    selDate.setHours(0,0,0,0);
    return tugasList.some(t => {
      if (!t.tanggalMulai || !t.tanggalSelesai) return false;
      const start = new Date(t.tanggalMulai);
      start.setHours(0,0,0,0);
      const end = new Date(t.tanggalSelesai);
      end.setHours(23,59,59,999);
      return selDate >= start && selDate <= end;
    });
  };

  if (selectedDate) {
    displayDateStr = formatDate(selectedDate.toISOString());
    const selDate = new Date(selectedDate);
    selDate.setHours(0,0,0,0);
    
    tugasPadaTanggal = tugasList.filter(t => {
      if (!t.tanggalMulai || !t.tanggalSelesai) return false;
      const start = new Date(t.tanggalMulai);
      start.setHours(0,0,0,0);
      const end = new Date(t.tanggalSelesai);
      end.setHours(23,59,59,999);
      return selDate >= start && selDate <= end;
    });
  }


  const formatLokasiDisplay = (lokasi?: string) => {
    if (!lokasi) return '';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titik Penugasan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-slate-800">{activeLocations.length}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Titik Lokasi Aktif di Lapangan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penugasan Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-800">{totalOrangAktif}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Pegawai Terlibat (On-Site)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pegawai</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-violet-800">{pegawaiList.length}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Data Pegawai Terdaftar</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Rekap Penugasan 2026 */}
        <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[280px]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">Rekap Penugasan 2026</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">Total pegawai yang tercatat dalam penugasan per bulan.</p>
              </div>
            </div>
            <Link to="../rekap-penugasan" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors rounded-lg text-xs font-bold whitespace-nowrap">
              Lihat rekap <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {/* Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
            {[
              { label: 'JAN', h: '6%' },
              { label: 'FEB', h: '6%' },
              { label: 'MAR', h: '6%' },
              { label: 'APR', h: '6%' },
              { label: 'MEI', h: '6%' },
              { label: 'JUN', h: '6%' },
              { label: 'JUL', h: '25%' },
              { label: 'AGT', h: '95%' },
              { label: 'SEP', h: '6%' },
              { label: 'OKT', h: '6%' },
              { label: 'NOV', h: '6%' },
              { label: 'DES', h: '6%' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div className="w-full max-w-[36px] bg-slate-50 rounded-t-lg h-[130px] relative overflow-hidden flex items-end">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ease-out ${item.label === 'AGT' || item.label === 'JUL' ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-blue-500'}`}
                    style={{ height: item.h }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-3">{item.label}</span>
              </div>
            ))}
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
              to="/super-admin/pemetaan"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Lihat Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
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

      {/* Stacked Tables Layout: Recent Assignments & Selected Date Tasks */}
      <div className="space-y-6">
        
        {/* Ajuan Surat Tugas Terbaru (MOVED UP) */}
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
              const unitColor = getUnitColor(item.unitKerja);
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
                    <h4 className="text-base font-semibold text-slate-900 whitespace-nowrap overflow-x-auto">{item.uraianKegiatan}</h4>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${unitColor.bg} ${unitColor.text}`}>
                      {item.unitKerja}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 whitespace-nowrap">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      {formatLokasiDisplay(item.tempat)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        </div>

        {/* Calendar and Selected Date Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Widget */}
          <div className="lg:col-span-1">
            <CalendarWidget 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate}
              initialMonth={new Date(2026, 0, 1)}
              hasTask={checkHasTask}
            />
          </div>

          {/* Penugasan Pada Tanggal */}
          <div className="lg:col-span-3 w-full bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Penugasan Aktif ({displayDateStr})
              </h3>
            </div>

            <div className="overflow-x-auto pb-2">
              {tugasPadaTanggal.length > 0 ? (
                <div className="flex gap-4 min-w-max">
                  {tugasPadaTanggal.map((item) => {
                    const unitColor = getUnitColor(item.unitKerja);
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
                          <h4 className="text-base font-semibold text-slate-900 whitespace-nowrap overflow-x-auto">{item.uraianKegiatan}</h4>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 items-center">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${unitColor.bg} ${unitColor.text}`}>
                            {item.unitKerja}
                          </span>
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 whitespace-nowrap">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            {formatLokasiDisplay(item.tempat)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
                  {selectedDate ? "Tidak ada penugasan aktif pada tanggal ini." : "Pilih tanggal di kalender untuk melihat penugasan."}
                </div>
              )}
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
              <h4 className="font-bold text-slate-900 text-sm">{selectedAjuan.uraianKegiatan}</h4>
              <p className="text-xs text-slate-600">{selectedAjuan.deskripsi}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">Tanggal Penugasan</div>
                <div className="text-sm font-semibold text-slate-800">{selectedAjuan.tanggalMulai} s/d {selectedAjuan.tanggalSelesai}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">Lokasi</div>
                <div className="text-sm font-semibold text-slate-800">{formatLokasiDisplay(selectedAjuan.tempat)}</div>
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
    </div>
  );
};
