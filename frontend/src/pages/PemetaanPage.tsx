import { useState } from 'react';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { dummyLokasiPenugasan, UNIT_COLORS } from '@/data/dummyData';
import { MapPin, Search, Layers, Navigation } from 'lucide-react';

export const PemetaanPage = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = dummyLokasiPenugasan.filter((loc) => {
    const matchesUnit = selectedUnit === 'ALL' || loc.unitKerja === selectedUnit;
    const matchesSearch =
      loc.pegawai.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.perihal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUnit && matchesSearch;
  });

  const totalAktif = dummyLokasiPenugasan.filter((l) => l.status === 'AKTIF').length;
  const totalMendatang = dummyLokasiPenugasan.filter((l) => l.status === 'MENDATANG').length;

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
            <span className="text-lg font-extrabold text-emerald-800">{totalAktif} Titik</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <span className="text-xs text-amber-700 font-medium block">Jadwal Mendatang</span>
            <span className="text-lg font-extrabold text-amber-800">{totalMendatang} Titik</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Pills per Unit Kerja */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pegawai, lokasi, perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Pilih Unit Kerja untuk Filter Marker Map:</span>
          </div>
        </div>

        {/* Filter Unit Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedUnit('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedUnit === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Unit Kerja ({dummyLokasiPenugasan.length})
          </button>

          {Object.entries(UNIT_COLORS).map(([unitName, color]) => {
            const isSelected = selectedUnit === unitName;
            const count = dummyLokasiPenugasan.filter((l) => l.unitKerja === unitName).length;

            return (
              <button
                key={unitName}
                onClick={() => setSelectedUnit(unitName)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? `${color.bg} ${color.text} ${color.border} shadow-xs ring-2 ring-blue-500/20`
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                <span>{unitName}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PenugasanMap locations={filteredLocations} selectedUnit={selectedUnit} height="h-[600px]" />
        </div>

        {/* Location Cards Side Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[600px]">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Navigation className="w-4 h-4 text-blue-600" />
            Daftar Sebaran Titik Penugasan ({filteredLocations.length})
          </h3>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {filteredLocations.map((loc) => {
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
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        loc.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
