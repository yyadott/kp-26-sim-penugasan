import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { UNIT_COLORS } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';

interface PenugasanMapProps {
  locations: LokasiPenugasanPegawai[];
  height?: string;
  selectedUnit?: string;
  showBoundary?: boolean;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  autoFitBounds?: boolean;
}

export const PenugasanMap = ({
  locations,
  height = 'h-[500px]',
  selectedUnit = 'ALL',
  showBoundary = true,
  defaultCenter = [-2.5, 118],
  defaultZoom = 5,
  autoFitBounds = true,
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
      // Default center configurable (Indonesia overview or specific area)
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers, polygons, and tooltip overlays
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Marker ||
        layer instanceof L.Polygon ||
        layer instanceof L.Tooltip
      ) {
        map.removeLayer(layer);
      }
    });

    if (filteredLocations.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Add markers and optionally boundary polygons
    filteredLocations.forEach((loc) => {
      const colorConfig = UNIT_COLORS[loc.unitKerja] || { hex: '#3b82f6' };
      const markerColor = '#3b82f6';

      // ===== BOUNDARY POLYGON (Wikipedia-style red outline) — only if showBoundary is true =====
      if (showBoundary && loc.batasWilayah && loc.batasWilayah.length > 0) {
        const polygon = L.polygon(loc.batasWilayah, {
          color: '#d63027',        // Garis merah (Wikipedia-style)
          weight: 3,               // Ketebalan garis
          opacity: 0.9,
          fillColor: '#d63027',
          fillOpacity: 0.05,       // Sangat transparan di dalam
          dashArray: undefined,    // Garis solid
          interactive: true,
        }).addTo(map);

        // Extend bounds to include the entire polygon
        loc.batasWilayah.forEach((coord) => bounds.extend(coord));

        // ===== LABEL TOOLTIP (Wikipedia-style) =====
        // Label nama lokasi ditampilkan di sisi bawah polygon
        const labelName = loc.namaLokasi || loc.lokasi;

        // Hitung posisi label — di bagian bawah-tengah polygon
        const polygonBounds = polygon.getBounds();
        const labelLat = polygonBounds.getSouth() + (polygonBounds.getNorth() - polygonBounds.getSouth()) * 0.15;
        const labelLng = polygonBounds.getCenter().lng;

        // Buat tooltip permanen layaknya Wikipedia
        const tooltipLabel = L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'boundary-label-tooltip',
          offset: [0, 0],
          interactive: false,
        })
          .setLatLng([labelLat, labelLng])
          .setContent(`<span class="boundary-label-text">${labelName}</span>`)
          .addTo(map);

        // Bind popup ke polygon juga
        polygon.bindPopup(`
          <div style="font-family: sans-serif; padding: 8px;">
            <h4 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">${labelName}</h4>
            <p style="font-size: 12px; color: #666; margin: 0;">${loc.alamatLengkap}</p>
          </div>
        `);

        // Keep reference for cleanup
        (polygon as any)._linkedTooltip = tooltipLabel;
      }

      // ===== MARKER ICON =====
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 30px;
            height: 40px;
            border-radius: 15px 15px 18px 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.25);
            border: 2px solid white;
            font-weight: bold;
            transition: transform 0.2s ease-in-out;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3" fill="white" opacity="0.9" />
            </svg>
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
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
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${loc.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }">${loc.status}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHTML);
    });

    if (filteredLocations.length > 0 && autoFitBounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (defaultCenter) {
      map.setView(defaultCenter, defaultZoom);
    }

    // Cleanup on unmount
    return () => {
      // Keep map instance alive for re-renders or clean properly if needed
    };
  }, [locations, selectedUnit, showBoundary, defaultCenter, defaultZoom, autoFitBounds]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className={`w-full ${height} z-0`} />
    </div>
  );
};
