import { useState } from 'react';
import { PenugasanMap } from '@/components/map/PenugasanMap';
import { dummyAjuanSuratTugas, UNIT_COLORS } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';
import { MapPin, Search, Layers, Navigation, Filter } from 'lucide-react';

export const PemetaanPage = () => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [isUnitFilterOpen, setIsUnitFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Satu sumber data dengan tabel Penugasan dan Dashboard.
  const mapLocations: LokasiPenugasanPegawai[] = dummyAjuanSuratTugas.map((item) => ({
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
        status: item.status === 'SURAT_TERBIT' ? 'AKTIF' : item.status === 'DITOLAK' ? 'SELESAI' : 'MENDATANG',
        markerType: 'approvedAjuan' as const,
      }));

  const filteredLocations = mapLocations.filter((loc) => {
    const matchesUnit = selectedUnits.length === 0 || selectedUnits.includes(loc.unitKerja);
    const matchesSearch =
      loc.pegawai.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.perihal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUnit && matchesSearch;
  });

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

      {/* Control Bar: Search & Filter Pills per Unit Kerja */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-end gap-3">
        <div className="contents">
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

          <div className="hidden text-xs font-semibold text-slate-500 items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Pilih Unit Kerja untuk Filter Marker Map:</span>
          </div>
        </div>

        {/* Filter Unit Kerja Multi-Select */}
        <div className="relative border-0 pt-0">
          <button
            type="button"
            onClick={() => setIsUnitFilterOpen((isOpen) => !isOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 sm:text-sm"
            aria-expanded={isUnitFilterOpen}
          >
            <Filter className="h-4 w-4 text-slate-400" />
            <span>{selectedUnits.length === 0 ? `Semua Unit Kerja (${mapLocations.length})` : `${selectedUnits.length} unit dipilih`}</span>
          </button>

          {isUnitFilterOpen && (
            <div
              className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
              onMouseLeave={() => setIsUnitFilterOpen(false)}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                <span className="text-xs font-bold text-slate-700">Filter Unit Kerja</span>
                {selectedUnits.length > 0 && (
                  <button type="button" onClick={() => setSelectedUnits([])} className="text-[11px] font-semibold text-blue-600 hover:underline">
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1 pt-2">
                {Object.entries(UNIT_COLORS).map(([unitName, color]) => {
                  const count = mapLocations.filter((location) => location.unitKerja === unitName).length;
                  return (
                    <label key={unitName} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedUnits.includes(unitName)}
                        onChange={() => setSelectedUnits((current) => current.includes(unitName) ? current.filter((unit) => unit !== unitName) : [...current, unitName])}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600 focus:ring-blue-500"
                      />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                      <span className="flex-1">{unitName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({count})</span>
                    </label>
                  );
                })}
              </div>
              <p className="border-t border-slate-100 px-2 pt-2 text-[11px] text-slate-400">Kosongkan pilihan untuk menampilkan semua unit.</p>
            </div>
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
