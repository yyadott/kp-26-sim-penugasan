import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { UNIT_COLORS } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';

interface PenugasanMapProps {
  locations: LokasiPenugasanPegawai[];
  height?: string;
  selectedUnit?: string;
}

export const PenugasanMap = ({
  locations,
  height = 'h-[500px]',
  selectedUnit = 'ALL',
}: PenugasanMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter locations based on selectedUnit
    const filteredLocations = selectedUnit === 'ALL'
      ? locations
      : locations.filter((loc) => loc.unitKerja === selectedUnit);

    // Initialize Map if not initialized
    if (!mapInstanceRef.current) {
      // Default center around Bandung & surrounding areas
      const map = L.map(mapContainerRef.current, {
        center: [-6.9175, 107.6191],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (filteredLocations.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Add markers
    filteredLocations.forEach((loc) => {
      const colorConfig = UNIT_COLORS[loc.unitKerja] || { hex: '#3b82f6' };

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${colorConfig.hex};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            font-weight: bold;
            font-size: 14px;
            transition: transform 0.2s ease-in-out;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(loc.koordinat, { icon: customIcon }).addTo(map);
      bounds.extend(loc.koordinat);

      // HTML Popup Content
      const popupHTML = `
        <div style="width: 280px; font-family: sans-serif; padding: 12px;" class="text-slate-800">
          <div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <img src="${loc.pegawai.fotoAvatar}" alt="${loc.pegawai.nama}" class="w-10 h-10 rounded-full object-cover border border-slate-200" />
            <div>
              <h4 class="font-bold text-sm text-slate-900 leading-tight">${loc.pegawai.nama}</h4>
              <p class="text-xs text-slate-500">NIP: ${loc.pegawai.nip}</p>
            </div>
          </div>
          
          <div class="space-y-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Unit Kerja:</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold" style="background-color: ${colorConfig.hex}20; color: ${colorConfig.hex}">
                ${loc.unitKerja}
              </span>
            </div>
            
            <div class="mt-1 pt-1">
              <span class="text-slate-500 block font-medium">Surat Tugas:</span>
              <span class="font-semibold text-slate-800 text-[11px] block">${loc.nomorSurat}</span>
            </div>
            
            <div>
              <span class="text-slate-500 block font-medium">Perihal:</span>
              <span class="text-slate-700 text-[11px] line-clamp-2">${loc.perihal}</span>
            </div>
            
            <div class="pt-1 flex items-center gap-1 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="font-medium text-[11px]">${loc.lokasi}</span>
            </div>
            
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-[10px] text-slate-400">Tgl: ${loc.tanggalMulai} s/d ${loc.tanggalSelesai}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                loc.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }">${loc.status}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHTML);
    });

    if (filteredLocations.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }

    // Cleanup on unmount
    return () => {
      // Keep map instance alive for re-renders or clean properly if needed
    };
  }, [locations, selectedUnit]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className={`w-full ${height} z-0`} />
    </div>
  );
};
