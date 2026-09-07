import { useState, useMemo } from 'react';
import type { LokasiPenugasanPegawai, Pegawai } from '@/types';
import { useSuratTugas } from '@/hooks/useSuratTugas';

export type FilterMode = 'ALL' | 'UNIT' | 'INDIVIDU';

interface UsePemetaanFilterProps {
  initialPegawaiId?: string;
  forceMode?: FilterMode;
}

const normalizeId = (id?: string) => {
  if (!id) return '';
  const num = parseInt(id.replace('peg-', ''), 10);
  return isNaN(num) ? String(id) : String(num);
};

export const idsMatch = (id1?: string, id2?: string) => {
  if (!id1 || !id2) return false;
  if (id1 === id2) return true;
  return normalizeId(id1) === normalizeId(id2);
};

export const usePemetaanFilter = (props?: UsePemetaanFilterProps) => {
  const [filterMode, setFilterMode] = useState<FilterMode>(props?.forceMode || 'ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>(props?.initialPegawaiId || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { tugasList } = useSuratTugas();

  // Build map locations from ajuan surat tugas
  const mapLocations: LokasiPenugasanPegawai[] = useMemo(() =>
    tugasList.flatMap((item) => {
      const pegawai = item.pegawaiDitugaskan?.length
        ? item.pegawaiDitugaskan
        : item.pengaju ? [item.pengaju] : [];

      return pegawai.map((person) => ({
        id: `approved-${item.id}-${person.id}`,
        suratTugasId: item.id,
        nomorSurat: item.nomorSurat,
        uraianKegiatan: item.uraianKegiatan,
        pegawai: person,
        unitKerja: item.unitKerja,
        lokasi: item.tempat,
        namaLokasi: item.lokasiSpesifik || item.tempat,
        alamatLengkap: [item.lokasiSpesifik, item.tempat].filter(Boolean).join(', '),
        koordinat: item.koordinat && item.koordinat.length === 2 && (item.koordinat[0] !== 0 || item.koordinat[1] !== 0)
          ? item.koordinat
          : [-6.9175 + (Math.random() - 0.5) * 0.05, 107.6191 + (Math.random() - 0.5) * 0.05],
        tanggalMulai: item.tanggalMulai,
        tanggalSelesai: item.tanggalSelesai,
        status: item.status === 'SURAT_TERBIT' ? 'AKTIF' as const : item.status === 'DITOLAK' ? 'SELESAI' as const : 'MENDATANG' as const,
        markerType: 'approvedAjuan' as const,
      }));
    }),
    [tugasList]);

  // Get unique pegawai from all ajuan surat tugas
  const allPegawaiInPenugasan = useMemo(() => {
    const pegawaiMap = new Map<string, Pegawai>();
    tugasList.forEach((item) => {
      item.pegawaiDitugaskan?.forEach((peg) => {
        if (peg && peg.id) pegawaiMap.set(normalizeId(peg.id), peg);
      });
      if (item.pengaju && item.pengaju.id) pegawaiMap.set(normalizeId(item.pengaju.id), item.pengaju);
    });
    return Array.from(pegawaiMap.values());
  }, [tugasList]);

  const filteredLocations = useMemo(() => {
    let filtered = mapLocations;

    if (filterMode === 'UNIT' && selectedUnit) {
      filtered = filtered.filter((loc) => loc.unitKerja === selectedUnit);
    } else if (filterMode === 'INDIVIDU' && selectedPegawaiId) {
      const matchingAjuanIds = tugasList
        .filter((item) =>
          item.pegawaiDitugaskan?.some((peg) => idsMatch(peg.id, selectedPegawaiId)) ||
          idsMatch(item.pengaju?.id, selectedPegawaiId)
        )
        .map((item) => item.id);
      filtered = filtered.filter((loc) => matchingAjuanIds.includes(loc.suratTugasId));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((loc) =>
        (loc.pegawai?.nama || '').toLowerCase().includes(q) ||
        (loc.lokasi || '').toLowerCase().includes(q) ||
        (loc.nomorSurat || '').toLowerCase().includes(q) ||
        (loc.uraianKegiatan || '').toLowerCase().includes(q) ||
        (loc.unitKerja || '').toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [mapLocations, filterMode, selectedUnit, selectedPegawaiId, searchQuery, tugasList]);

  const selectedPegawai = allPegawaiInPenugasan.find((p) => idsMatch(p.id, selectedPegawaiId));

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    if (mode === 'ALL') {
      setSelectedUnit('');
      setSelectedPegawaiId('');
    }
  };

  return {
    filterMode, setFilterMode, handleModeChange,
    selectedUnit, setSelectedUnit,
    selectedPegawaiId, setSelectedPegawaiId,
    searchQuery, setSearchQuery,
    filteredLocations,
    allPegawaiInPenugasan,
    mapLocations,
    selectedPegawai,
  };
};
