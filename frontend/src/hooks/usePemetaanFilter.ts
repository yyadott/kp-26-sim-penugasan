import { useState, useMemo, useEffect } from 'react';
import type { LokasiPenugasanPegawai, Pegawai } from '@/types';
import { useSuratTugas } from '@/hooks/useSuratTugas';

export type FilterMode = 'ALL' | 'UNIT' | 'INDIVIDU';

export const usePemetaanFilter = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { tugasList, refreshTugas } = useSuratTugas();

  useEffect(() => {
    refreshTugas();
  }, []);

  // Build map locations from ajuan surat tugas
  const mapLocations: LokasiPenugasanPegawai[] = useMemo(() =>
    tugasList.map((item) => ({
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
    [tugasList]);

  // Get unique pegawai from all ajuan surat tugas
  const allPegawaiInPenugasan = useMemo(() => {
    const pegawaiMap = new Map<string, Pegawai>();
    tugasList.forEach((item) => {
      item.pegawaiDitugaskan.forEach((peg) => {
        pegawaiMap.set(peg.id, peg);
      });
      if (item.pengaju) pegawaiMap.set(item.pengaju.id, item.pengaju);
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
          item.pegawaiDitugaskan.some((peg) => peg.id === selectedPegawaiId) ||
          item.pengaju?.id === selectedPegawaiId
        )
        .map((item) => item.id);
      filtered = filtered.filter((loc) => matchingAjuanIds.includes(loc.suratTugasId));
    }

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

  const selectedPegawai = allPegawaiInPenugasan.find((p) => p.id === selectedPegawaiId);

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
