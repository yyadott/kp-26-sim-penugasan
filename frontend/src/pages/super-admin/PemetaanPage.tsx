import { useState } from 'react';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { PenugasanCalendar } from '@/components/calendar/PenugasanCalendar';
import { dummyAjuanSuratTugas, getUnitColor } from '@/data/dummyData';
import { MapPin, Navigation, User, Map as MapIcon, Calendar } from 'lucide-react';
import { usePemetaanFilter } from '@/hooks/usePemetaanFilter';
import { PemetaanFilterBar } from '@/components/penugasan/PemetaanFilterBar';

export const PemetaanPage = () => {
  const [viewMode, setViewMode] = useState<'peta' | 'kalender'>('peta');
  const {
    filterMode, handleModeChange,
    selectedUnit, setSelectedUnit,
    selectedPegawaiId, setSelectedPegawaiId,
    searchQuery, setSearchQuery,
    filteredLocations,
    allPegawaiInPenugasan,
    mapLocations,
    selectedPegawai,
  } = usePemetaanFilter();


  const totalOrangAktif = dummyAjuanSuratTugas
    .filter((item) => item.status === 'SURAT_TERBIT')
    .reduce((total, item) => total + item.pegawaiDitugaskan.length, 0);
  const totalOrangMendatang = dummyAjuanSuratTugas
    .filter((item) => item.status !== 'SURAT_TERBIT' && item.status !== 'DITOLAK')
    .reduce((total, item) => total + item.pegawaiDitugaskan.length, 0);
  const totalOrangDitugaskan = dummyAjuanSuratTugas
    .reduce((total, item) => total + item.pegawaiDitugaskan.length, 0);

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

      {/* Interactive Visualizer Wrapper */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Active filter summary pill + View Mode Toggle */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
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
                  backgroundColor: `${getUnitColor(selectedUnit).hex}10`,
                  color: getUnitColor(selectedUnit).hex,
                  borderColor: `${getUnitColor(selectedUnit).hex}40`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getUnitColor(selectedUnit).hex }} />
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

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode('peta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${viewMode === 'peta' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Peta
            </button>
            <button
              onClick={() => setViewMode('kalender')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${viewMode === 'kalender' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Kalender
            </button>
          </div>
        </div>

        {/* Interactive Visualizer */}
        {viewMode === 'peta' ? (
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
                    const color = getUnitColor(loc.unitKerja);

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
        ) : (
          <PenugasanCalendar
            locations={filteredLocations}
            height="h-[620px]"
          />
        )}
      </div>
    </div>
  );
};
