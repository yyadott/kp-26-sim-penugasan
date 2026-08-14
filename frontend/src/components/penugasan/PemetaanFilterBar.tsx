import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Filter, Users, User, Globe, ChevronDown, X } from 'lucide-react';
import { UNIT_COLORS } from '@/data/dummyData';
import type { FilterMode } from '@/hooks/usePemetaanFilter';
import type { LokasiPenugasanPegawai } from '@/types';

interface PemetaanFilterBarProps {
  filterMode: FilterMode;
  handleModeChange: (mode: FilterMode) => void;
  selectedUnit: string;
  setSelectedUnit: (val: string) => void;
  selectedPegawaiId: string;
  setSelectedPegawaiId: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  allPegawaiInPenugasan: any[];
  mapLocations: LokasiPenugasanPegawai[];
}

export const PemetaanFilterBar = ({
  filterMode,
  handleModeChange,
  selectedUnit,
  setSelectedUnit,
  selectedPegawaiId,
  setSelectedPegawaiId,
  searchQuery,
  setSearchQuery,
  allPegawaiInPenugasan,
  mapLocations,
}: PemetaanFilterBarProps) => {
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

  const filteredPegawaiList = useMemo(() =>
    allPegawaiInPenugasan.filter((peg) =>
      peg.nama.toLowerCase().includes(pegawaiSearchQuery.toLowerCase()) ||
      peg.nip.includes(pegawaiSearchQuery) ||
      peg.unitKerja.toLowerCase().includes(pegawaiSearchQuery.toLowerCase())
    ),
    [allPegawaiInPenugasan, pegawaiSearchQuery]);

  const filterModes: { mode: FilterMode; label: string; icon: React.ReactNode; description: string }[] = [
    { mode: 'ALL', label: 'Semua Data', icon: <Globe className="w-4 h-4" />, description: 'Tampilkan semua titik penugasan' },
    { mode: 'UNIT', label: 'Per Unit', icon: <Users className="w-4 h-4" />, description: 'Filter berdasarkan unit kerja' },
    { mode: 'INDIVIDU', label: 'Per Individu', icon: <User className="w-4 h-4" />, description: 'Filter berdasarkan pegawai' },
  ];

  return (
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
              onClick={() => {
                 handleModeChange(mode);
                 setIsUnitDropdownOpen(false);
                 setIsPegawaiDropdownOpen(false);
              }}
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
                onClick={() => setSelectedUnit('')}
                className="absolute -right-2 -top-2 bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1 border border-slate-200 transition-colors"
                title="Hapus filter unit"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Dropdown Menu */}
            {isUnitDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[9000] max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {Object.entries(UNIT_COLORS).map(([unit, color]) => {
                  const count = mapLocations.filter((l) => l.unitKerja === unit).length;
                  const isSelected = selectedUnit === unit;
                  if (count === 0) return null; // Hide units with no assignments
                  return (
                    <button
                      key={unit}
                      onClick={() => {
                        setSelectedUnit(unit);
                        setIsUnitDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                        <span className={`text-sm ${isSelected ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>
                          {unit}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{count} tugas</span>
                    </button>
                  );
                })}
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
                  ? 'border-violet-300 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50'
                }`}
            >
              {selectedPegawaiId ? (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>{allPegawaiInPenugasan.find(p => p.id === selectedPegawaiId)?.nama || 'Pegawai Terpilih'}</span>
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
                onClick={() => setSelectedPegawaiId('')}
                className="absolute -right-2 -top-2 bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1 border border-slate-200 transition-colors"
                title="Hapus filter pegawai"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Dropdown Menu */}
            {isPegawaiDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[9000] animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIP..."
                      value={pegawaiSearchQuery}
                      onChange={(e) => setPegawaiSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {filteredPegawaiList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">Pegawai tidak ditemukan.</div>
                  ) : (
                    filteredPegawaiList.map((peg) => {
                      const isSelected = selectedPegawaiId === peg.id;
                      const unitColor = UNIT_COLORS[peg.unitKerja];

                      return (
                        <button
                          key={peg.id}
                          onClick={() => {
                            setSelectedPegawaiId(peg.id);
                            setIsPegawaiDropdownOpen(false);
                            setPegawaiSearchQuery(''); // reset search
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={peg.fotoAvatar} alt={peg.nama} className="w-7 h-7 rounded-full object-cover bg-slate-100 border border-slate-200" />
                            <div className="flex flex-col">
                              <span className={`text-xs ${isSelected ? 'font-bold text-blue-700' : 'font-semibold text-slate-700'}`}>{peg.nama}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
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
                          </div>
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
    </div>
  );
};
