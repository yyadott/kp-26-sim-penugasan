import { useState, useMemo, useEffect } from 'react';
import { UNIT_COLORS } from '@/data/dummyData';
import { Trophy, ChevronDown, Briefcase, Building2, Table2, Filter } from 'lucide-react';
import { useSuratTugas } from '@/hooks/useSuratTugas';
import { usePegawai } from '@/hooks/usePegawai';
import apiClient from '@/api/client';

type SubTab = 'jabatan' | 'unitkerja' | 'tabelrekap';
type JenisDinas = 'Semua' | 'Luar' | 'Dalam';

// Simulated "jenis dinas" for each surat tugas based on location
const getJenisDinas = (lokasi: string): string => {
  if (!lokasi) return 'Luar';
  if (lokasi.toLowerCase().includes('bogor') || lokasi.toLowerCase().includes('dalam kota') || lokasi.toLowerCase().includes('cibinong')) return 'Dalam';
  return 'Luar';
};

const UNIT_LIST: string[] = ['Kepeg', 'Fastingkom', 'PM'];

const SUB_TABS: { key: SubTab; label: string; icon: React.ReactNode }[] = [
  { key: 'jabatan', label: 'Kelompok Jabatan', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'unitkerja', label: 'Kelompok Unit Kerja', icon: <Building2 className="w-4 h-4" /> },
  { key: 'tabelrekap', label: 'Tabel Rekap', icon: <Table2 className="w-4 h-4" /> },
];

const JENIS_DINAS_OPTIONS: JenisDinas[] = ['Semua', 'Luar', 'Dalam'];

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

export const RekapPenugasanPage = () => {
  const [tahun, setTahun] = useState<number | 'Semua'>('Semua');
  const [bulan, setBulan] = useState<number | 'Semua'>('Semua');
  const [subTab, setSubTab] = useState<SubTab>('jabatan');
  const [jenisDinasFilter, setJenisDinasFilter] = useState<JenisDinas>('Semua');
  const [jabatanFilter, setJabatanFilter] = useState<string>('Semua');
  const [unitKerjaFilter, setUnitKerjaFilter] = useState<string>('Semua');
  const [JABATAN_LIST, setJABATAN_LIST] = useState<string[]>([]);
  
  const { tugasList, refreshTugas } = useSuratTugas();
  const { pegawaiList } = usePegawai();

  useEffect(() => {
    apiClient.get('/users').then(res => {
      if (res.data) {
        const uniqueJabatans = [...new Set(res.data.map((p: any) => p.jabatan))];
        setJABATAN_LIST(uniqueJabatans as string[]);
      }
    });
    refreshTugas();
  }, []);

  // Compute penugasan data
  const penugasanData = useMemo(() => {
    // Each surat tugas -> for each pegawai assigned -> one entry
    const entries = tugasList
      .filter(st => {
        if (!st.tanggalMulai) return false;
        const date = new Date(st.tanggalMulai);
        if (isNaN(date.getTime())) return false;
        
        if (tahun !== 'Semua') {
          const matchTahun = date.getFullYear() === tahun;
          if (!matchTahun) return false;
        }
        
        if (bulan === 'Semua') return true;
        return (date.getMonth() + 1) === bulan;
      })
      .flatMap(st =>
        st.pegawaiDitugaskan.map(peg => {
          const matched = pegawaiList.find((p) => p.nama === peg.nama) || peg;
          return {
            pegawai: matched,
            jenisDinas: getJenisDinas(st.tempat),
            suratTugas: st,
          };
        })
      );
    return entries;
  }, [tahun, bulan, tugasList, pegawaiList]);

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

  // Tabel Rekap data
  const rekapTableData = useMemo(() => {
    const countMap = new Map<string, { nip: string; nama: string; unitKerja: string; total: number }>();
    filteredEntries.forEach(e => {
      const existing = countMap.get(e.pegawai.id);
      if (existing) {
        existing.total++;
      } else {
        countMap.set(e.pegawai.id, {
          nip: e.pegawai.nip,
          nama: e.pegawai.nama,
          unitKerja: e.pegawai.unitKerja,
          total: 1,
        });
      }
    });
    return [...countMap.values()].sort((a, b) => b.total - a.total);
  }, [filteredEntries]);

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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header with Year & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Rekap Penugasan Pegawai</h1>
          <p className="text-sm text-slate-500 mt-1">Data rekapitulasi penugasan seluruh pegawai.</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Bulan:</label>
            <div className="relative">
              <select
                value={bulan}
                onChange={e => setBulan(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))}
                className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="Semua">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Tahun:</label>
            <div className="relative">
              <select
                value={tahun}
                onChange={e => setTahun(e.target.value === 'Semua' ? 'Semua' : Number(e.target.value))}
                className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="Semua">Semua Tahun</option>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
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
            <p className="col-span-full text-center text-sm text-slate-400 py-4">Belum ada data penugasan luar pada {tahun === 'Semua' ? 'semua tahun' : `tahun ${tahun}`}.</p>
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

        {/* c. Tabel Rekap */}
        {subTab === 'tabelrekap' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Tabel Rekap Penugasan Pegawai</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold w-12">#</th>
                    <th className="px-5 py-3.5 font-semibold">NIP</th>
                    <th className="px-5 py-3.5 font-semibold">Nama</th>
                    <th className="px-5 py-3.5 font-semibold">Unit Kerja</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekapTableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        Tidak ada data untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    rekapTableData.map((row, i) => (
                      <tr key={row.nip} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-5 py-3.5 font-mono text-[13px] text-slate-600">{row.nip}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{row.nama}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${UNIT_COLORS[row.unitKerja]
                              ? `${UNIT_COLORS[row.unitKerja].bg} ${UNIT_COLORS[row.unitKerja].text} ${UNIT_COLORS[row.unitKerja].border}`
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                            {row.unitKerja}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                            {row.total}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
