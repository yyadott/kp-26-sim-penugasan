import { useState, useMemo } from 'react';
import { dummyAjuanSuratTugas, dummyPegawaiList } from '@/data/dummyData';
import type { LokasiPenugasanPegawai } from '@/types';

export type FilterMode = 'ALL' | 'UNIT' | 'INDIVIDU';

export const usePemetaanFilter = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Get unique pegawai from all ajuan surat tugas
  const allPegawaiInPenugasan = useMemo(() => {
    const pegawaiMap = new Map<string, typeof dummyPegawaiList[0]>();
    dummyAjuanSuratTugas.forEach((item) => {
      item.pegawaiDitugaskan.forEach((peg) => {
        pegawaiMap.set(peg.id, peg);
      });
      pegawaiMap.set(item.pengaju.id, item.pengaju);
    });
    return Array.from(pegawaiMap.values());
  }, []);

  const filteredLocations = useMemo(() => {
    let filtered = mapLocations;

    if (filterMode === 'UNIT' && selectedUnit) {
      filtered = filtered.filter((loc) => loc.unitKerja === selectedUnit);
    } else if (filterMode === 'INDIVIDU' && selectedPegawaiId) {
      const matchingAjuanIds = dummyAjuanSuratTugas
        .filter((item) =>
          item.pegawaiDitugaskan.some((peg) => peg.id === selectedPegawaiId) ||
          item.pengaju.id === selectedPegawaiId
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
