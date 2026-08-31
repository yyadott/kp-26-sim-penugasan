import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { dummyPegawaiList, dummyAjuanSuratTugas, UNIT_COLORS } from '@/data/dummyData';
import { Trophy, ChevronDown, ChevronLeft, ChevronRight, Briefcase, Building2, Table2, Filter, Calendar, Info, X, MapPin, FileText, Tag } from 'lucide-react';

type SubTab = 'jabatan' | 'unitkerja' | 'tabelrekap';
type JenisDinas = 'Semua' | 'Luar' | 'Dalam' | 'Daring' | 'Izin';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Simulated "jenis dinas" for each surat tugas based on location
const getJenisDinas = (lokasi: string): string => {
  if (lokasi.includes('Cimahi') || lokasi.includes('Bandung')) return 'Luar';
  if (lokasi.includes('Bogor')) return 'Dalam';
  if (lokasi.includes('Depok')) return 'Daring';
  if (lokasi.includes('Jakarta') || lokasi.includes('Sukabumi')) return 'Izin';
  return 'Luar';
};

const JENIS_DINAS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Luar: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: '#3b82f6' },
  Dalam: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: '#10b981' },
  Daring: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300', dot: '#8b5cf6' },
  Izin: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: '#f59e0b' },
};

// Get unique jabatan list from pegawai
const JABATAN_LIST = [...new Set(dummyPegawaiList.map(p => p.jabatan))];
const UNIT_LIST: string[] = ['Kepeg', 'Fastingkom', 'PM'];

const SUB_TABS: { key: SubTab; label: string; icon: React.ReactNode }[] = [
  { key: 'jabatan', label: 'Kelompok Jabatan', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'unitkerja', label: 'Kelompok Unit Kerja', icon: <Building2 className="w-4 h-4" /> },
  { key: 'tabelrekap', label: 'Tabel Rekap', icon: <Table2 className="w-4 h-4" /> },
];

const JENIS_DINAS_OPTIONS: JenisDinas[] = ['Semua', 'Luar', 'Dalam', 'Daring', 'Izin'];

// CSS bar chart component
const BarChart = ({ data, maxValue, colorFn }: { data: { label: string; value: number }[]; maxValue: number; colorFn: (label: string) => string }) => (
  <div className="space-y-3">
    {data.map((item, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-40 text-right text-xs font-medium text-slate-700 truncate shrink-0">{item.label}</div>
        <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
            style={{
              width: maxValue > 0 ? `${Math.max((item.value / maxValue) * 100, 4)}%` : '4%',
              background: colorFn(item.label),
            }}
          >
            <span className="text-[11px] font-bold text-white drop-shadow-sm">{item.value}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Helper: get number of days in a month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Helper: check if a date falls within a range (inclusive)
const isDateInRange = (dateStr: string, startStr: string, endStr: string): boolean => {
  const d = new Date(dateStr).getTime();
  const s = new Date(startStr).getTime();
  const e = new Date(endStr).getTime();
  return d >= s && d <= e;
};

type TooltipEntry = { uraianKegiatan: string; lokasi: string; jenisDinas: string; nomorSurat: string };
type TooltipData = { entries: TooltipEntry[]; day: number; bulan: number; tahun: number; pegawaiNama: string; rect: DOMRect } | null;
type ModalData = { entries: TooltipEntry[]; day: number; bulan: number; tahun: number; pegawaiNama: string } | null;

// Portal-based tooltip that renders outside overflow container
const FloatingTooltip = ({ data }: { data: TooltipData }) => {
  if (!data) return null;
  const { entries, day, bulan, tahun, rect } = data;

  // Calculate position: prefer above the cell, fallback below
  const tooltipWidth = 280;
  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  let top = rect.top - 8;
  let arrowPosition: 'bottom' | 'top' = 'bottom';

  // Keep within viewport horizontally
  if (left < 8) left = 8;
  if (left + tooltipWidth > window.innerWidth - 8) left = window.innerWidth - tooltipWidth - 8;

  // If not enough space above, show below
  if (rect.top < 160) {
    top = rect.bottom + 8;
    arrowPosition = 'top';
  }

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: `${left}px`,
        top: arrowPosition === 'bottom' ? 'auto' : `${top}px`,
        bottom: arrowPosition === 'bottom' ? `${window.innerHeight - top}px` : 'auto',
        width: `${tooltipWidth}px`,
      }}
    >
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-3.5 text-[11px] animate-in fade-in duration-150">
        <div className="font-bold text-xs mb-2 text-blue-300">{day} {NAMA_BULAN[bulan]} {tahun}</div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {entries.map((e, i) => (
            <div key={i} className="border-l-2 pl-2.5 py-0.5" style={{ borderColor: JENIS_DINAS_COLORS[e.jenisDinas]?.dot || '#94a3b8' }}>
              <div className="font-semibold text-white/90">{e.nomorSurat}</div>
              <div className="text-white/70 leading-relaxed">{e.uraianKegiatan}</div>
              <div className="text-white/50 mt-0.5">{e.lokasi} · <span className="font-medium" style={{ color: JENIS_DINAS_COLORS[e.jenisDinas]?.dot }}>{e.jenisDinas}</span></div>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/40 text-center">Klik untuk detail lengkap</div>
      </div>
      {/* Arrow */}
      {arrowPosition === 'bottom' && (
        <div className="flex justify-center">
          <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-transparent border-t-slate-900" />
        </div>
      )}
      {arrowPosition === 'top' && (
        <div className="flex justify-center" style={{ marginTop: '-1px', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-transparent border-b-slate-900" style={{ marginTop: '-7px' }} />
        </div>
      )}
    </div>,
    document.body
  );
};

// Full detail modal when a cell is clicked
const DetailModal = ({ data, onClose }: { data: ModalData; onClose: () => void }) => {
  if (!data) return null;
  const { entries, day, bulan, tahun, pegawaiNama } = data;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Detail Penugasan</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {pegawaiNama} — {day} {NAMA_BULAN[bulan]} {tahun}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {entries.map((e, i) => {
            const color = JENIS_DINAS_COLORS[e.jenisDinas];
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
              >
                {/* Nomor Surat */}
                <div className="flex items-start gap-2.5 mb-3">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nomor Surat</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{e.nomorSurat}</div>
                  </div>
                </div>

                {/* Uraian Kegiatan */}
                <div className="flex items-start gap-2.5 mb-3">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Uraian Kegiatan</div>
                    <div className="text-sm text-slate-700 mt-0.5 leading-relaxed">{e.uraianKegiatan}</div>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="flex items-start gap-2.5 mb-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tempat</div>
                    <div className="text-sm text-slate-700 mt-0.5">{e.lokasi}</div>
                  </div>
                </div>

                {/* Jenis Dinas */}
                <div className="flex items-start gap-2.5">
                  <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Jenis Dinas</div>
                    <span
                      className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${color
                        ? `${color.bg} ${color.text} ${color.border}`
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color?.dot || '#94a3b8' }} />
                      Dinas {e.jenisDinas}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-400 text-center">
            {entries.length} penugasan pada tanggal ini
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const RekapPenugasanPage = () => {
  const [tahun, setTahun] = useState(2026);
  const [subTab, setSubTab] = useState<SubTab>('jabatan');
  const [jenisDinasFilter, setJenisDinasFilter] = useState<JenisDinas>('Semua');
  const [jabatanFilter, setJabatanFilter] = useState<string>('Semua');
  const [unitKerjaFilter, setUnitKerjaFilter] = useState<string>('Semua');
  const [bulan, setBulan] = useState(new Date().getMonth()); // 0-indexed
  const [rekapUnitFilter, setRekapUnitFilter] = useState<string>('Semua');
  const [tooltipData, setTooltipData] = useState<TooltipData>(null);
  const [modalData, setModalData] = useState<ModalData>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalData(null);
    };
    if (modalData) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [modalData]);

  const handleCellMouseEnter = useCallback((e: React.MouseEvent, entries: TooltipEntry[], day: number, pegawaiNama: string) => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipData({ entries, day, bulan, tahun, pegawaiNama, rect });
    }, 150);
  }, [bulan, tahun]);

  const handleCellMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setTooltipData(null);
  }, []);

  const handleCellClick = useCallback((entries: TooltipEntry[], day: number, pegawaiNama: string) => {
    setTooltipData(null);
    setModalData({ entries, day, bulan, tahun, pegawaiNama });
  }, [bulan, tahun]);

  // Compute penugasan data
  const penugasanData = useMemo(() => {
    // Each surat tugas -> for each pegawai assigned -> one entry
    const entries = dummyAjuanSuratTugas
      .filter(st => st.tanggalMulai.startsWith(String(tahun)))
      .flatMap(st =>
        st.pegawaiDitugaskan.map(peg => ({
          pegawai: peg,
          jenisDinas: getJenisDinas(st.tempat),
          suratTugas: st,
        }))
      );
    return entries;
  }, [tahun]);

  // Filter entries by jenis dinas
  const filteredEntries = useMemo(() => {
    if (jenisDinasFilter === 'Semua') return penugasanData;
    return penugasanData.filter(e => e.jenisDinas === jenisDinasFilter);
  }, [penugasanData, jenisDinasFilter]);

  // Top 6 pegawai with most "Luar" assignments
  const top6 = useMemo(() => {
    const luarEntries = penugasanData.filter(e => e.jenisDinas === 'Luar');
    const countMap = new Map<string, { nama: string; nip: string; count: number }>();
    luarEntries.forEach(e => {
      const existing = countMap.get(e.pegawai.id);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(e.pegawai.id, { nama: e.pegawai.nama, nip: e.pegawai.nip, count: 1 });
      }
    });
    return [...countMap.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [penugasanData]);

  // Chart data for Kelompok Jabatan
  const jabatanChartData = useMemo(() => {
    let entries = filteredEntries;
    if (jabatanFilter !== 'Semua') {
      entries = entries.filter(e => e.pegawai.jabatan === jabatanFilter);
    }
    const countMap = new Map<string, number>();
    entries.forEach(e => {
      countMap.set(e.pegawai.jabatan, (countMap.get(e.pegawai.jabatan) || 0) + 1);
    });
    return JABATAN_LIST.map(j => ({ label: j, value: countMap.get(j) || 0 }));
  }, [filteredEntries, jabatanFilter]);

  // Chart data for Kelompok Unit Kerja
  const unitKerjaChartData = useMemo(() => {
    let entries = filteredEntries;
    if (unitKerjaFilter !== 'Semua') {
      entries = entries.filter(e => e.pegawai.unitKerja === unitKerjaFilter);
    }
    const countMap = new Map<string, number>();
    entries.forEach(e => {
      countMap.set(e.pegawai.unitKerja, (countMap.get(e.pegawai.unitKerja) || 0) + 1);
    });
    return UNIT_LIST.map(u => ({ label: u, value: countMap.get(u) || 0 }));
  }, [filteredEntries, unitKerjaFilter]);

  // ============================================================
  // Tabel Rekap Bulanan: per pegawai, per tanggal (1-31) dalam 1 bulan
  // ============================================================
  const daysInMonth = getDaysInMonth(tahun, bulan);

  const rekapBulananData = useMemo(() => {
    // Filter pegawai by unit
    let pegawaiFiltered = dummyPegawaiList;
    if (rekapUnitFilter !== 'Semua') {
      pegawaiFiltered = pegawaiFiltered.filter(p => p.unitKerja === rekapUnitFilter);
    }

    // Build per-pegawai, per-day map
    const result = pegawaiFiltered.map(peg => {
      // Find all surat tugas where this pegawai is assigned, in the selected year
      const pegEntries = dummyAjuanSuratTugas
        .filter(st => st.pegawaiDitugaskan.some(p => p.id === peg.id))
        .filter(st => {
          // Filter: surat tugas that overlaps with the selected month
          const stStart = new Date(st.tanggalMulai);
          const stEnd = new Date(st.tanggalSelesai);
          const monthStart = new Date(tahun, bulan, 1);
          const monthEnd = new Date(tahun, bulan, daysInMonth);
          return stStart <= monthEnd && stEnd >= monthStart;
        });

      // Apply jenis dinas filter
      const filteredPegEntries = jenisDinasFilter === 'Semua'
        ? pegEntries
        : pegEntries.filter(st => getJenisDinas(st.tempat) === jenisDinasFilter);

      // Build daily entries
      const days: { day: number; entries: { uraianKegiatan: string; lokasi: string; jenisDinas: string; nomorSurat: string }[] }[] = [];
      let totalBulan = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEntries = filteredPegEntries
          .filter(st => isDateInRange(dateStr, st.tanggalMulai, st.tanggalSelesai))
          .map(st => ({
            uraianKegiatan: st.uraianKegiatan,
            lokasi: st.tempat,
            jenisDinas: getJenisDinas(st.tempat),
            nomorSurat: st.nomorSurat,
          }));
        days.push({ day: d, entries: dayEntries });
        totalBulan += dayEntries.length;
      }

      return {
        pegawai: peg,
        days,
        totalBulan,
      };
    });

    // Sort by total descending
    return result.sort((a, b) => b.totalBulan - a.totalBulan);
  }, [tahun, bulan, daysInMonth, jenisDinasFilter, rekapUnitFilter]);

  // Summary stats for the month
  const monthlyStats = useMemo(() => {
    let totalPenugasan = 0;
    let totalPegawaiAktif = 0;
    rekapBulananData.forEach(row => {
      if (row.totalBulan > 0) totalPegawaiAktif++;
      totalPenugasan += row.totalBulan;
    });
    return { totalPenugasan, totalPegawaiAktif };
  }, [rekapBulananData]);

  const maxJabatan = Math.max(...jabatanChartData.map(d => d.value), 1);
  const maxUnit = Math.max(...unitKerjaChartData.map(d => d.value), 1);

  const GRADIENT_COLORS = [
    'linear-gradient(135deg, #6366f1, #818cf8)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #3b82f6, #60a5fa)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  ];

  // Month navigation
  const prevMonth = () => {
    if (bulan === 0) {
      setBulan(11);
      setTahun(t => t - 1);
    } else {
      setBulan(b => b - 1);
    }
  };
  const nextMonth = () => {
    if (bulan === 11) {
      setBulan(0);
      setTahun(t => t + 1);
    } else {
      setBulan(b => b + 1);
    }
  };

  // Day of week for column header styling
  const getDayOfWeek = (day: number) => new Date(tahun, bulan, day).getDay(); // 0=Sun, 6=Sat

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Rekap Penugasan Pegawai</h1>
          <p className="text-sm text-slate-500 mt-1">Data rekapitulasi penugasan seluruh pegawai per tahun.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Tahun:</label>
          <div className="relative">
            <select
              value={tahun}
              onChange={e => setTahun(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Top 6 Pegawai - Penugasan Luar Terbanyak */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-800">6 Besar Pegawai Penugasan Luar Terbanyak</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {top6.length === 0 ? (
            <p className="col-span-full text-center text-sm text-slate-400 py-4">Belum ada data penugasan luar pada tahun {tahun}.</p>
          ) : (
            top6.map((peg, i) => (
              <div
                key={peg.nip}
                className="relative p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-all group"
              >
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shadow-sm"
                  style={{ background: GRADIENT_COLORS[i] || GRADIENT_COLORS[0] }}
                >
                  #{i + 1}
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{peg.nama}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{peg.nip}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-black text-blue-600">{peg.count}</span>
                    <span className="text-[11px] text-slate-500 font-medium">penugasan</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {SUB_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${subTab === tab.key
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Global Jenis Dinas Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-600">Jenis Dinas:</span>
        {JENIS_DINAS_OPTIONS.map(jd => (
          <button
            key={jd}
            onClick={() => setJenisDinasFilter(jd)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${jenisDinasFilter === jd
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {jd}
          </button>
        ))}
      </div>

      {/* Sub-Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        {/* a. Kelompok Jabatan */}
        {subTab === 'jabatan' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-bold text-slate-800">Grafik Penugasan per Kelompok Jabatan</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Filter Jabatan:</span>
                <select
                  value={jabatanFilter}
                  onChange={e => setJabatanFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Semua">Semua Jabatan</option>
                  {JABATAN_LIST.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
            </div>
            <BarChart
              data={jabatanChartData}
              maxValue={maxJabatan}
              colorFn={(label) => {
                const idx = JABATAN_LIST.indexOf(label);
                return GRADIENT_COLORS[idx % GRADIENT_COLORS.length].replace('linear-gradient(135deg, ', '').replace(')', '').split(',')[0].trim();
              }}
            />
            {jabatanChartData.every(d => d.value === 0) && (
              <p className="text-center text-sm text-slate-400 py-4">Tidak ada data penugasan untuk filter ini.</p>
            )}
          </div>
        )}

        {/* b. Kelompok Unit Kerja */}
        {subTab === 'unitkerja' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="font-bold text-slate-800">Grafik Penugasan per Kelompok Unit Kerja</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Filter Unit Kerja:</span>
                <select
                  value={unitKerjaFilter}
                  onChange={e => setUnitKerjaFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Semua">Semua Unit</option>
                  {UNIT_LIST.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <BarChart
              data={unitKerjaChartData}
              maxValue={maxUnit}
              colorFn={(label) => UNIT_COLORS[label]?.hex || '#6366f1'}
            />
            {unitKerjaChartData.every(d => d.value === 0) && (
              <p className="text-center text-sm text-slate-400 py-4">Tidak ada data penugasan untuk filter ini.</p>
            )}
          </div>
        )}

        {/* c. Tabel Rekap Bulanan */}
        {subTab === 'tabelrekap' && (
          <div className="space-y-5">
            {/* Header: Title + Month Navigator + Unit Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-lg">Rekap Penugasan Bulanan</h3>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Unit Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Unit Kerja:</span>
                  <div className="relative">
                    <select
                      value={rekapUnitFilter}
                      onChange={e => setRekapUnitFilter(e.target.value)}
                      className="appearance-none text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-7 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Semua">Semua Unit</option>
                      {UNIT_LIST.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-3 py-1 text-sm font-bold text-slate-800 min-w-[140px] text-center">
                    {NAMA_BULAN[bulan]} {tahun}
                  </div>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Total Penugasan</div>
                <div className="text-2xl font-black text-blue-800 mt-1">{monthlyStats.totalPenugasan}</div>
                <div className="text-[11px] text-blue-500 mt-0.5">{NAMA_BULAN[bulan]} {tahun}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Pegawai Aktif</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">{monthlyStats.totalPegawaiAktif}</div>
                <div className="text-[11px] text-emerald-500 mt-0.5">dari {rekapBulananData.length} pegawai</div>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">Hari Kerja</div>
                <div className="text-2xl font-black text-violet-800 mt-1">{daysInMonth}</div>
                <div className="text-[11px] text-violet-500 mt-0.5">hari dalam bulan</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-3.5">
                <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Rata-rata</div>
                <div className="text-2xl font-black text-amber-800 mt-1">
                  {monthlyStats.totalPegawaiAktif > 0 ? (monthlyStats.totalPenugasan / monthlyStats.totalPegawaiAktif).toFixed(1) : '0'}
                </div>
                <div className="text-[11px] text-amber-500 mt-0.5">tugas / pegawai aktif</div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap text-[11px]">
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
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-slate-200" />
                <span className="font-medium text-slate-500">Tidak ada tugas</span>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-[11px] border-collapse" style={{ minWidth: `${200 + daysInMonth * 38 + 60}px` }}>
                <thead>
                  {/* Day numbers row */}
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-3 py-2.5 font-semibold text-slate-600 text-xs sticky left-0 bg-slate-50/80 z-20 border-r border-slate-200" style={{ minWidth: '200px' }}>
                      Pegawai
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const dayNum = i + 1;
                      const dow = getDayOfWeek(dayNum);
                      const isWeekend = dow === 0 || dow === 6;
                      return (
                        <th
                          key={dayNum}
                          className={`px-0 py-2.5 text-center font-bold text-[11px] ${isWeekend ? 'text-red-400 bg-red-50/40' : 'text-slate-600'}`}
                          style={{ minWidth: '36px', width: '36px' }}
                        >
                          <div>{dayNum}</div>
                          <div className={`text-[9px] font-medium mt-0.5 ${isWeekend ? 'text-red-300' : 'text-slate-400'}`}>
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dow]}
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-3 py-2.5 font-bold text-slate-700 text-center text-xs border-l border-slate-200" style={{ minWidth: '56px' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekapBulananData.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 2} className="px-5 py-12 text-center text-slate-400 text-sm">
                        Tidak ada data pegawai untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    rekapBulananData.map((row) => (
                      <tr key={row.pegawai.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Pegawai info - sticky left */}
                        <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-slate-200" style={{ minWidth: '200px' }}>
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${UNIT_COLORS[row.pegawai.unitKerja]
                                ? `${UNIT_COLORS[row.pegawai.unitKerja].bg} ${UNIT_COLORS[row.pegawai.unitKerja].text} ${UNIT_COLORS[row.pegawai.unitKerja].border}`
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {row.pegawai.unitKerja}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 text-[11px] truncate max-w-[120px]">{row.pegawai.nama}</div>
                              <div className="text-[9px] text-slate-400 font-mono">{row.pegawai.nip}</div>
                            </div>
                          </div>
                        </td>

                        {/* Day cells */}
                        {row.days.map((dayData) => {
                          const dow = getDayOfWeek(dayData.day);
                          const isWeekend = dow === 0 || dow === 6;
                          const count = dayData.entries.length;
                          const hasEntry = count > 0;

                          // Get primary jenis dinas color for the cell
                          const primaryJenis = hasEntry ? dayData.entries[0].jenisDinas : '';
                          const color = JENIS_DINAS_COLORS[primaryJenis];

                          return (
                            <td
                              key={dayData.day}
                              className={`px-0 py-1 text-center ${isWeekend ? 'bg-red-50/20' : ''}`}
                              style={{ minWidth: '36px', width: '36px' }}
                            >
                              {hasEntry ? (
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md border ${color
                                      ? `${color.bg} ${color.text} ${color.border}`
                                      : 'bg-blue-100 text-blue-800 border-blue-300'
                                      }`}
                                    onMouseEnter={(e) => handleCellMouseEnter(e, dayData.entries, dayData.day, row.pegawai.nama)}
                                    onMouseLeave={handleCellMouseLeave}
                                    onClick={() => handleCellClick(dayData.entries, dayData.day, row.pegawai.nama)}
                                  >
                                    {count}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <div className={`w-7 h-7 rounded-lg ${isWeekend ? 'bg-red-50' : 'bg-slate-50'}`} />
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Total column */}
                        <td className="px-3 py-2 text-center border-l border-slate-200">
                          {row.totalBulan > 0 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                              {row.totalBulan}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer info */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Arahkan kursor ke sel berwarna untuk preview, atau klik untuk melihat detail lengkap penugasan.
            </div>
          </div>
        )}
      </div>
      {/* Floating Tooltip (Portal) */}
      <FloatingTooltip data={tooltipData} />

      {/* Detail Modal (Portal) */}
      <DetailModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
};
