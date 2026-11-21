import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UNIT_COLORS } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';
import { ChevronLeft, ChevronRight, FileText, X, Filter, Tag, Info, MapPin, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

// Simulated "jenis dinas" for each surat tugas based on location
const getJenisDinas = (lokasi?: string): string => {
  if (!lokasi) return 'Luar';
  if (lokasi.includes('BBPPMPV BMTI')) return 'Dalam';
  return 'Luar';
};

const JENIS_DINAS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Luar: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: '#3b82f6' },
  Dalam: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: '#10b981' },
};

interface CalendarEntry {
  id: string;
  nomorSurat: string;
  uraianKegiatan: string;
  lokasi: string;
  jenisDinas: string;
  unitKerja: string;
  pegawaiNames: string[];
  tanggalMulai: string;
  tanggalSelesai: string;
}

interface DayData {
  day: number;
  entries: CalendarEntry[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

type ModalData = { entries: CalendarEntry[]; day: number; bulan: number; tahun: number } | null;

interface PenugasanCalendarProps {
  locations: LokasiPenugasanPegawai[];
  height?: string;
}

// Helper: get number of days in a month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Helper: get day of week (0=Mon, 6=Sun)
const getMondayBasedDay = (year: number, month: number, day: number) => {
  const d = new Date(year, month, day).getDay();
  return d === 0 ? 6 : d - 1; // Convert Sunday=0 to 6, Monday=1 to 0, etc.
};

// Helper: check if a date falls within a range
const isDateInRange = (dateStr: string, startStr: string, endStr: string): boolean => {
  const d = new Date(dateStr).getTime();
  return d >= new Date(startStr).getTime() && d <= new Date(endStr).getTime();
};

// Detail Modal
const DetailModal = ({ data, onClose }: { data: ModalData; onClose: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filterLokasi, setFilterLokasi] = useState('ALL');
  const [filterJenis, setFilterJenis] = useState('ALL');

  const getBasePath = () => {
    return location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  };

  if (!data) return null;
  const { entries, day, bulan, tahun } = data;

  const allLokasi = Array.from(new Set(entries.map(e => e.lokasi)));
  const allJenis = Array.from(new Set(entries.map(e => e.jenisDinas)));
  
  // Hitung jumlah pegawai unik dari seluruh entries
  const allPegawai = new Set<string>();
  entries.forEach(e => {
    e.pegawaiNames.forEach(p => allPegawai.add(p));
  });

  const filteredEntries = entries.filter(e => {
    const matchLokasi = filterLokasi === 'ALL' || e.lokasi === filterLokasi;
    const matchJenis = filterJenis === 'ALL' || e.jenisDinas === filterJenis;
    
    return matchLokasi && matchJenis;
  });

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-200 shrink-0 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Sebaran Penugasan</h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{day} {NAMA_BULAN[bulan]} {tahun}</p>
            <div className="flex gap-3 mt-2 text-xs font-semibold">
               <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200">{entries.length} Surat Tugas</span>
               <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200">{allPegawai.size} Pegawai Ditugaskan</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 self-start sm:self-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="flex gap-2 w-full">
            <div className="relative w-full sm:w-auto min-w-[130px]">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <select 
                value={filterLokasi}
                onChange={e => setFilterLokasi(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Semua Lokasi</option>
                {allLokasi.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <select 
                value={filterJenis}
                onChange={e => setFilterJenis(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">Semua Jenis</option>
                {allJenis.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 bg-slate-50/30">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Tidak ada penugasan yang sesuai dengan filter pencarian.</div>
          ) : (
            filteredEntries.map((e, i) => {
              const color = JENIS_DINAS_COLORS[e.jenisDinas];
              const unitColor = UNIT_COLORS[e.unitKerja];
              return (
                <div key={i} onClick={() => { onClose(); navigate(`${getBasePath()}/tugas?tab=berlangsung&taskId=${e.id}`); }} className="rounded-xl border border-slate-200 p-4 bg-white hover:shadow-md transition-shadow space-y-3 cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{e.nomorSurat}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: `${unitColor?.hex || '#6366f1'}20`, color: unitColor?.hex || '#6366f1' }}
                      >
                        {e.unitKerja}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${color ? `${color.bg} ${color.text} ${color.border}` : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color?.dot || '#94a3b8' }} />
                        {e.jenisDinas}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-700 leading-relaxed">{e.uraianKegiatan}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600">{e.lokasi}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {e.pegawaiNames.map((name, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">{name}</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {e.tanggalMulai} s.d. {e.tanggalSelesai}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const PenugasanCalendar = ({ locations, height = 'h-[500px]' }: PenugasanCalendarProps) => {
  const now = new Date();
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState(0); // 0 = Januari
  const [modalData, setModalData] = useState<ModalData>(null);
  const [tooltipData, setTooltipData] = useState<{ entries: CalendarEntry[]; day: number; rect: DOMRect } | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!modalData) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalData(null); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [modalData]);

  // Build calendar data from locations (purely based on filtered locations prop)
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(tahun, bulan);
    const firstDayOffset = getMondayBasedDay(tahun, bulan, 1);
    const today = new Date();

    const days: DayData[] = [];

    // Previous month padding
    const prevMonth = bulan === 0 ? 11 : bulan - 1;
    const prevYear = bulan === 0 ? tahun - 1 : tahun;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        entries: [],
        isCurrentMonth: false,
        isToday: false,
        isWeekend: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = getMondayBasedDay(tahun, bulan, d);
      const isWeekend = dow >= 5;
      const isToday = today.getFullYear() === tahun && today.getMonth() === bulan && today.getDate() === d;

      // Filter locations for this day
      const locationsInDay = locations.filter(loc => isDateInRange(dateStr, loc.tanggalMulai, loc.tanggalSelesai));
      
      // Group by suratTugasId to merge pegawais from the same assignment
      const groupedByTugas = new Map<string, LokasiPenugasanPegawai[]>();
      locationsInDay.forEach(loc => {
        if (!groupedByTugas.has(loc.suratTugasId)) {
          groupedByTugas.set(loc.suratTugasId, []);
        }
        groupedByTugas.get(loc.suratTugasId)!.push(loc);
      });

      // Build CalendarEntry from grouped locations
      const dayEntries: CalendarEntry[] = Array.from(groupedByTugas.values()).map(group => {
        const firstLoc = group[0];
        // Ensure unique names in case of duplicate marker types for the same person
        const uniquePegawaiNames = Array.from(new Set(group.map(g => g.pegawai.nama)));
        return {
          id: firstLoc.suratTugasId,
          nomorSurat: firstLoc.nomorSurat,
          uraianKegiatan: firstLoc.uraianKegiatan,
          lokasi: firstLoc.lokasi,
          jenisDinas: getJenisDinas(firstLoc.lokasi),
          unitKerja: firstLoc.unitKerja,
          pegawaiNames: uniquePegawaiNames,
          tanggalMulai: firstLoc.tanggalMulai,
          tanggalSelesai: firstLoc.tanggalSelesai,
        };
      });

      days.push({ day: d, entries: dayEntries, isCurrentMonth: true, isToday, isWeekend });
    }

    // Next month padding
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, entries: [], isCurrentMonth: false, isToday: false, isWeekend: false });
    }

    return days;
  }, [tahun, bulan, locations]);

  // Stats
  const monthStats = useMemo(() => {
    const currentMonthDays = calendarData.filter(d => d.isCurrentMonth);
    const totalPenugasan = currentMonthDays.reduce((s, d) => s + d.entries.length, 0);
    const activeDays = currentMonthDays.filter(d => d.entries.length > 0).length;
    // Unique jenis dinas
    const jenisSet = new Set<string>();
    currentMonthDays.forEach(d => d.entries.forEach(e => jenisSet.add(e.jenisDinas)));
    return { totalPenugasan, activeDays, jenisCount: jenisSet.size };
  }, [calendarData]);

  // Navigation
  const prevMonth = () => {
    if (bulan === 0) { setBulan(11); setTahun(t => t - 1); }
    else setBulan(b => b - 1);
  };
  const nextMonth = () => {
    if (bulan === 11) { setBulan(0); setTahun(t => t + 1); }
    else setBulan(b => b + 1);
  };
  const goToday = () => { setTahun(now.getFullYear()); setBulan(now.getMonth()); };

  const handleMouseEnter = useCallback((e: React.MouseEvent, entries: CalendarEntry[], day: number) => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipTimeoutRef.current = setTimeout(() => setTooltipData({ entries, day, rect }), 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setTooltipData(null);
  }, []);

  const handleClick = useCallback((entries: CalendarEntry[], day: number) => {
    setTooltipData(null);
    setModalData({ entries, day, bulan, tahun });
  }, [bulan, tahun]);



  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col ${height}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-sm font-bold text-slate-800 min-w-[150px] text-center">
              {NAMA_BULAN[bulan]} {tahun}
            </div>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={goToday} className="px-3 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            Hari Ini
          </button>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
            {monthStats.totalPenugasan} penugasan
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {monthStats.activeDays} hari aktif
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {NAMA_HARI.map((h, i) => (
            <div key={h} className={`text-center text-[11px] font-bold py-2 ${i >= 5 ? 'text-red-400' : 'text-slate-500'}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((dayData, idx) => {
            const hasEntries = dayData.entries.length > 0;


            return (
              <div
                key={idx}
                className={`relative rounded-xl p-1.5 min-h-[72px] transition-all duration-150 border ${
                  !dayData.isCurrentMonth
                    ? 'bg-slate-50/50 border-transparent opacity-40'
                    : dayData.isToday
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : hasEntries
                        ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                        : dayData.isWeekend
                          ? 'bg-red-50/30 border-transparent'
                          : 'bg-white border-transparent hover:bg-slate-50'
                }`}
                onMouseEnter={hasEntries && dayData.isCurrentMonth ? (e) => handleMouseEnter(e, dayData.entries, dayData.day) : undefined}
                onMouseLeave={hasEntries ? handleMouseLeave : undefined}
                onClick={hasEntries && dayData.isCurrentMonth ? () => handleClick(dayData.entries, dayData.day) : undefined}
              >
                {/* Day Number */}
                <div className={`text-[12px] font-bold ${
                  !dayData.isCurrentMonth ? 'text-slate-300'
                    : dayData.isToday ? 'text-blue-700'
                      : dayData.isWeekend ? 'text-red-400'
                        : 'text-slate-700'
                }`}>
                  {dayData.isToday ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[11px]">
                      {dayData.day}
                    </span>
                  ) : dayData.day}
                </div>

                {/* Entry indicators */}
                {hasEntries && dayData.isCurrentMonth && (
                  <div className="mt-1 flex flex-col gap-1">
                    {(() => {
                      const jenisCounts: Record<string, number> = {};
                      dayData.entries.forEach(e => { jenisCounts[e.jenisDinas] = (jenisCounts[e.jenisDinas] || 0) + 1; });
                      return Object.entries(jenisCounts).map(([jenis, count]) => {
                        const c = JENIS_DINAS_COLORS[jenis];
                        return (
                          <div
                            key={jenis}
                            className={`flex justify-between items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${c ? `${c.bg} ${c.text} ${c.border}` : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                          >
                            <div className="flex items-center gap-1">
                               <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c?.dot }} />
                               <span>{jenis}</span>
                            </div>
                            <span>+{count}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-200 flex items-center gap-4 flex-wrap text-[11px] shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5" />
          Jenis Dinas:
        </div>
        {Object.entries(JENIS_DINAS_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: val.dot }} />
            <span className="font-medium text-slate-600">{key}</span>
          </div>
        ))}
      </div>

      {/* Floating Tooltip */}
      {tooltipData && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${Math.min(Math.max(tooltipData.rect.left + tooltipData.rect.width / 2 - 130, 8), window.innerWidth - 268)}px`,
            bottom: `${window.innerHeight - tooltipData.rect.top + 8}px`,
            width: '260px',
          }}
        >
          <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-3 text-[11px]">
            <div className="font-bold text-xs mb-2 text-blue-300">{tooltipData.day} {NAMA_BULAN[bulan]} {tahun}</div>
            <div className="space-y-1.5">
              {tooltipData.entries.slice(0, 3).map((e, i) => (
                <div key={i} className="border-l-2 pl-2 py-0.5" style={{ borderColor: JENIS_DINAS_COLORS[e.jenisDinas]?.dot || '#94a3b8' }}>
                  <div className="font-semibold text-white/90">{e.nomorSurat}</div>
                  <div className="text-white/60 truncate">{e.uraianKegiatan}</div>
                  <div className="text-white/50">{e.lokasi} · <span className="font-medium" style={{ color: JENIS_DINAS_COLORS[e.jenisDinas]?.dot }}>{e.jenisDinas}</span></div>
                </div>
              ))}
              {tooltipData.entries.length > 3 && (
                <div className="text-white/50 text-[10px] italic pt-1 text-center">
                  + {tooltipData.entries.length - 3} penugasan lainnya
                </div>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/40 text-center">Klik untuk detail lengkap</div>
          </div>
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-transparent border-t-slate-900" />
          </div>
        </div>,
        document.body
      )}

      {/* Detail Modal */}
      <DetailModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
};
