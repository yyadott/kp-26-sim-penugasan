import { useState, useMemo, useRef, useEffect } from 'react';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { dummyAjuanSuratTugas, dummyPegawaiList, UNIT_COLORS } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';
import { MapPin, Search, Navigation, Filter, Users, User, Globe, ChevronDown, X } from 'lucide-react';

type FilterMode = 'ALL' | 'UNIT' | 'INDIVIDU';

export const PemetaanPage = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown open states
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isPegawaiDropdownOpen, setIsPegawaiDropdownOpen] = useState(false);
  const [pegawaiSearchQuery, setPegawaiSearchQuery] = useState('');

  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const pegawaiDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target as Node)) {
        setIsUnitDropdownOpen(false);
      }
      if (pegawaiDropdownRef.current && !pegawaiDropdownRef.current.contains(e.target as Node)) {
        setIsPegawaiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build map locations from ajuan surat tugas
  const mapLocations: LokasiPenugasanPegawai[] = useMemo(() =>
    dummyAjuanSuratTugas.map((item) => ({
      id: `approved-${item.id}`,
      suratTugasId: item.id,
      nomorSurat: item.nomorSurat,
      perihal: item.perihal,
      pegawai: item.pegawaiDitugaskan[0] || item.pengaju,
      unitKerja: item.unitKerja,
      lokasi: item.lokasiPenugasan,
      namaLokasi: item.lokasiSpesifik || item.lokasiPenugasan,
      alamatLengkap: [item.lokasiSpesifik, item.lokasiPenugasan].filter(Boolean).join(', '),
      koordinat: item.koordinat,
      tanggalMulai: item.tanggalMulai,
      tanggalSelesai: item.tanggalSelesai,
      status: item.status === 'SURAT_TERBIT' ? 'AKTIF' as const : item.status === 'DITOLAK' ? 'SELESAI' as const : 'MENDATANG' as const,
      markerType: 'approvedAjuan' as const,
    })),
    []);

  // Get unique pegawai from all ajuan surat tugas (all assigned pegawai)
  const allPegawaiInPenugasan = useMemo(() => {
    const pegawaiMap = new Map<string, typeof dummyPegawaiList[0]>();
    dummyAjuanSuratTugas.forEach((item) => {
      item.pegawaiDitugaskan.forEach((peg) => {
        pegawaiMap.set(peg.id, peg);
      });
      // Also include pengaju
      pegawaiMap.set(item.pengaju.id, item.pengaju);
    });
    return Array.from(pegawaiMap.values());
  }, []);

  // Filter pegawai for dropdown search
  const filteredPegawaiList = useMemo(() =>
    allPegawaiInPenugasan.filter((peg) =>
      peg.nama.toLowerCase().includes(pegawaiSearchQuery.toLowerCase()) ||
      peg.nip.includes(pegawaiSearchQuery) ||
      peg.unitKerja.toLowerCase().includes(pegawaiSearchQuery.toLowerCase())
    ),
    [allPegawaiInPenugasan, pegawaiSearchQuery]);

  // Apply filter to locations
  const filteredLocations = useMemo(() => {
    let filtered = mapLocations;

    // Apply mode-based filter
    if (filterMode === 'UNIT' && selectedUnit) {
      filtered = filtered.filter((loc) => loc.unitKerja === selectedUnit);
    } else if (filterMode === 'INDIVIDU' && selectedPegawaiId) {
      // Filter ajuan that include the selected pegawai
      const matchingAjuanIds = dummyAjuanSuratTugas
        .filter((item) =>
          item.pegawaiDitugaskan.some((peg) => peg.id === selectedPegawaiId) ||
          item.pengaju.id === selectedPegawaiId
        )
        .map((item) => item.id);
      filtered = filtered.filter((loc) => matchingAjuanIds.includes(loc.suratTugasId));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((loc) =>
        loc.pegawai.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.perihal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [mapLocations, filterMode, selectedUnit, selectedPegawaiId, searchQuery]);

  const totalOrangAktif = dummyAjuanSuratTugas
    .filter((item) => item.status === 'SURAT_TERBIT')
    .reduce((total, item) => total + item.pegawaiDitugaskan.length, 0);
  const totalOrangMendatang = dummyAjuanSuratTugas
    .filter((item) => item.status !== 'SURAT_TERBIT' && item.status !== 'DITOLAK')
    .reduce((total, item) => total + item.pegawaiDitugaskan.length, 0);
  const totalOrangDitugaskan = dummyAjuanSuratTugas
    .reduce((total, item) => total + item.pegawaiDitugaskan.length, 0);

  const selectedPegawai = allPegawaiInPenugasan.find((p) => p.id === selectedPegawaiId);

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    // Reset sub-filters when switching modes
    if (mode === 'ALL') {
      setSelectedUnit('');
      setSelectedPegawaiId('');
    }
    setIsUnitDropdownOpen(false);
    setIsPegawaiDropdownOpen(false);
  };

  const filterModes: { mode: FilterMode; label: string; icon: React.ReactNode; description: string }[] = [
    { mode: 'ALL', label: 'Semua Data', icon: <Globe className="w-4 h-4" />, description: 'Tampilkan semua titik penugasan' },
    { mode: 'UNIT', label: 'Per Unit', icon: <Users className="w-4 h-4" />, description: 'Filter berdasarkan unit kerja' },
    { mode: 'INDIVIDU', label: 'Per Individu', icon: <User className="w-4 h-4" />, description: 'Filter berdasarkan pegawai' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Visualisasi Pemetaan Lokasi Penugasan Pegawai</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Pemantauan lokasi penugasan tiap-tiap pegawai dari unit kerja yang berbeda-beda secara realtime berbasis peta interaktif.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-emerald-700 font-medium block">Penugasan Aktif</span>
            <span className="text-lg font-extrabold text-emerald-800">{totalOrangAktif} Orang</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-amber-700 font-medium block">Jadwal Mendatang</span>
            <span className="text-lg font-extrabold text-amber-800">{totalOrangMendatang} Orang</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-blue-700 font-medium block">Total Ditugaskan</span>
            <span className="text-lg font-extrabold text-blue-800">{totalOrangDitugaskan} Orang</span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Filter Mode Segmented Control + Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-600 mr-1 hidden sm:inline">Mode Filter:</span>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
            {filterModes.map(({ mode, label, icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeChange(mode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${filterMode === mode
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pegawai, lokasi, perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 2: Sub-filter (conditional based on mode) */}
        {filterMode === 'UNIT' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-semibold text-slate-500">Pilih Unit Kerja:</span>

            <div className="relative" ref={unitDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUnitDropdownOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm ${selectedUnit
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                {selectedUnit ? (
                  <>
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: UNIT_COLORS[selectedUnit]?.hex || '#6366f1' }}
                    />
                    <span>{selectedUnit}</span>
                    <span className="text-[10px] font-mono text-blue-400">
                      ({mapLocations.filter((l) => l.unitKerja === selectedUnit).length})
                    </span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pilih Unit Kerja</span>
                  </>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Clear button */}
              {selectedUnit && (
                <button
                  type="button"
                  onClick={() => { setSelectedUnit(''); setIsUnitDropdownOpen(false); }}
                  className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Hapus filter unit"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {isUnitDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="space-y-1">
                    {Object.entries(UNIT_COLORS).map(([unitName, color]) => {
                      const count = mapLocations.filter((l) => l.unitKerja === unitName).length;
                      const isSelected = selectedUnit === unitName;
                      return (
                        <button
                          key={unitName}
                          type="button"
                          onClick={() => { setSelectedUnit(unitName); setIsUnitDropdownOpen(false); }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all ${isSelected
                              ? 'bg-blue-50 text-blue-800 font-bold ring-1 ring-blue-200'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                        >
                          <span className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: color.hex }} />
                          <span className="flex-1 text-left">{unitName}</span>
                          <span className={`font-mono text-[10px] ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                            {count} tugas
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {filterMode === 'INDIVIDU' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-semibold text-slate-500">Pilih Pegawai:</span>

            <div className="relative" ref={pegawaiDropdownRef}>
              <button
                type="button"
                onClick={() => setIsPegawaiDropdownOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm ${selectedPegawaiId
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
              >
                {selectedPegawai ? (
                  <>
                    <img
                      src={selectedPegawai.fotoAvatar}
                      alt={selectedPegawai.nama}
                      className="w-5 h-5 rounded-full object-cover border border-white shadow-sm"
                    />
                    <span className="max-w-[180px] truncate">{selectedPegawai.nama}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: `${UNIT_COLORS[selectedPegawai.unitKerja]?.hex || '#6366f1'}20`,
                        color: UNIT_COLORS[selectedPegawai.unitKerja]?.hex || '#6366f1'
                      }}
                    >
                      {selectedPegawai.unitKerja}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pilih Pegawai</span>
                  </>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPegawaiDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Clear button */}
              {selectedPegawaiId && (
                <button
                  type="button"
                  onClick={() => { setSelectedPegawaiId(''); setIsPegawaiDropdownOpen(false); }}
                  className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Hapus filter individu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {isPegawaiDropdownOpen && (
                <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                  {/* Search in dropdown */}
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari nama atau NIP..."
                        value={pegawaiSearchQuery}
                        onChange={(e) => setPegawaiSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Pegawai list */}
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredPegawaiList.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Pegawai tidak ditemukan</p>
                    ) : (
                      filteredPegawaiList.map((peg) => {
                        const isSelected = selectedPegawaiId === peg.id;
                        const penugasanCount = dummyAjuanSuratTugas.filter((item) =>
                          item.pegawaiDitugaskan.some((p) => p.id === peg.id) || item.pengaju.id === peg.id
                        ).length;
                        const unitColor = UNIT_COLORS[peg.unitKerja];

                        return (
                          <button
                            key={peg.id}
                            type="button"
                            onClick={() => {
                              setSelectedPegawaiId(peg.id);
                              setIsPegawaiDropdownOpen(false);
                              setPegawaiSearchQuery('');
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${isSelected
                                ? 'bg-blue-50 ring-1 ring-blue-200'
                                : 'hover:bg-slate-50'
                              }`}
                          >
                            <img
                              src={peg.fotoAvatar}
                              alt={peg.nama}
                              className={`w-8 h-8 rounded-full object-cover border-2 shadow-sm ${isSelected ? 'border-blue-400' : 'border-white'
                                }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs truncate ${isSelected ? 'font-bold text-blue-800' : 'font-semibold text-slate-800'}`}>
                                {peg.nama}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono">{peg.nip}</span>
                                <span
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                  style={{
                                    backgroundColor: `${unitColor?.hex || '#6366f1'}20`,
                                    color: unitColor?.hex || '#6366f1'
                                  }}
                                >
                                  {peg.unitKerja}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                              {penugasanCount} tugas
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active filter summary pill */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Menampilkan:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
            <MapPin className="w-3 h-3" />
            {filteredLocations.length} titik penugasan
          </span>
          {filterMode === 'UNIT' && selectedUnit && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border"
              style={{
                backgroundColor: `${UNIT_COLORS[selectedUnit]?.hex || '#6366f1'}10`,
                color: UNIT_COLORS[selectedUnit]?.hex || '#6366f1',
                borderColor: `${UNIT_COLORS[selectedUnit]?.hex || '#6366f1'}40`,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: UNIT_COLORS[selectedUnit]?.hex }} />
              Unit {selectedUnit}
            </span>
          )}
          {filterMode === 'INDIVIDU' && selectedPegawai && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 font-bold border border-violet-200">
              <User className="w-3 h-3" />
              {selectedPegawai.nama}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PenugasanMap
            locations={filteredLocations}
            selectedUnit="ALL"
            height="h-[600px]"
            showBoundary={false}
            defaultCenter={[-2.5, 118]}
            defaultZoom={5}
            autoFitBounds={false}
          />
        </div>

        {/* Location Cards Side Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[600px]">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Navigation className="w-4 h-4 text-blue-600" />
            Daftar Sebaran Titik Penugasan ({filteredLocations.length})
          </h3>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Tidak ada data penugasan</p>
                <p className="text-xs text-slate-400 mt-1">
                  {filterMode === 'UNIT' && !selectedUnit
                    ? 'Silakan pilih unit kerja terlebih dahulu.'
                    : filterMode === 'INDIVIDU' && !selectedPegawaiId
                      ? 'Silakan pilih pegawai terlebih dahulu.'
                      : 'Coba ubah filter atau kata kunci pencarian.'}
                </p>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const color = UNIT_COLORS[loc.unitKerja] || { bg: 'bg-slate-100', text: 'text-slate-800', hex: '#3b82f6' };

                return (
                  <div
                    key={loc.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ backgroundColor: `${color.hex}20`, color: color.hex }}
                      >
                        {loc.unitKerja}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${loc.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {loc.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{loc.perihal}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{loc.nomorSurat}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <img
                        src={loc.pegawai.fotoAvatar}
                        alt={loc.pegawai.nama}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{loc.pegawai.nama}</p>
                        <p className="text-[10px] text-slate-500">{loc.pegawai.jabatan}</p>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{loc.lokasi}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{loc.alamatLengkap}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
