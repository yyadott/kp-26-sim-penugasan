import type {
  Pegawai,
  AjuanSuratTugas,
  PresensiItem,
  RekapPresensiPribadi,
  LokasiPenugasanPegawai,
} from '@/types';

// Data Pegawai
export const dummyPegawaiList: Pegawai[] = [
  {
    id: '1',
    nama: 'Taryadi',
    nip: '2350081041',
    unitKerja: 'Kepeg',
    jabatan: 'Super Admin',
    email: 'taryadi@pemda.go.id',
    fotoAvatar: `${import.meta.env.BASE_URL}pp-navbar-2.jpg`,
    role: 'SUPER_ADMIN',
  },
  {
    id: '2',
    nama: 'Yudi',
    nip: '198503122010011002',
    unitKerja: 'Fastingkom',
    jabatan: 'Front Office',
    email: 'yudi@ulp.go.id',
    fotoAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'PEGAWAI',
  },
  {
    id: '3',
    nama: 'Budi Santoso, S.T., M.Si.',
    nip: '198711042012021005',
    unitKerja: 'Kepeg',
    jabatan: 'Koordinator Pengawasan Lalu Lintas',
    email: 'budi.santoso@dishub.go.id',
    fotoAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    role: 'PEGAWAI',
  },
  {
    id: '4',
    nama: 'Siti Rahmawati, S.H.',
    nip: '199204152015032001',
    unitKerja: 'PM',
    jabatan: 'Kasi Penertiban & Operasional',
    email: 'siti.rahmawati@satpolpp.go.id',
    fotoAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'PEGAWAI',
  },
  {
    id: '5',
    nama: 'Ir. Hendra Wijaya',
    nip: '198208202008011008',
    unitKerja: 'Fastingkom',
    jabatan: 'Subkoordinator Pemeliharaan Jalan',
    email: 'hendra.w@dpu.go.id',
    fotoAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    role: 'PEGAWAI',
  },
  {
    id: '6',
    nama: 'Dewi Lestari, S.E., M.M.',
    nip: '199001012014022003',
    unitKerja: 'Kepeg',
    jabatan: 'Analis Perencanaan Protokol',
    email: 'dewi.lestari@setda.go.id',
    fotoAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    role: 'PEGAWAI',
  },
  {
    id: '7',
    nama: 'Arnest, S.Kom.',
    nip: '200101010001',
    unitKerja: 'Fastingkom',
    jabatan: 'Pegawai',
    email: 'pegawai.demo@pemda.go.id',
    username: 'pegawai',
    fotoAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    role: 'PEGAWAI',
  },
  {
    id: '8',
    nama: 'Admin Tugas',
    nip: '2350081042',
    unitKerja: 'Kepeg',
    jabatan: 'Admin Penugasan',
    email: 'admin.tugas@pemda.go.id',
    username: 'admintugas',
    fotoAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    role: 'ADMIN',
  },
];

// Data Ajuan Surat Tugas & Workflow Stage
export const dummyAjuanSuratTugas: AjuanSuratTugas[] = [
  {
    id: 'AJ-001',
    nomorSurat: '094/01/AJ-KEPEG/2026',
    uraianKegiatan: 'Konsolidasi Data Kepegawaian Daerah',
    pengaju: dummyPegawaiList[1], // Yudi (Fastingkom)
    pegawaiDitugaskan: [dummyPegawaiList[1], dummyPegawaiList[4]],
    unitKerja: 'Fastingkom',
    tanggalMulai: '2026-09-01',
    tanggalSelesai: '2026-09-03',
    tempat: 'BKN Regional',
    koordinat: [-6.9147, 107.6098],
    lokasiSpesifik: 'Gedung A, Ruang Rapat Utama',
    deskripsi: 'Sinkronisasi data sistem kepegawaian dengan BKN Regional dalam rangka pemutakhiran data.',
    status: 'DRAFT',
    workflow: [
      {
        stage: 'DRAFT',
        label: 'Diajukan',
        actor: 'Yudi',
        tanggal: '2026-08-30 09:00',
        status: 'COMPLETED'
      },
      {
        stage: 'VERIFIKASI_SUBBAGIAN',
        label: 'Menunggu Verifikasi',
        actor: 'Admin Kepegawaian',
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'AJ-002',
    nomorSurat: '094/02/AJ-PM/2026',
    uraianKegiatan: 'Survei Lokasi Penertiban Reklame',
    pengaju: dummyPegawaiList[3], // Siti Rahmawati
    pegawaiDitugaskan: [dummyPegawaiList[3]],
    unitKerja: 'PM',
    tanggalMulai: '2026-09-05',
    tanggalSelesai: '2026-09-06',
    tempat: 'Jalan Protokol Kota',
    koordinat: [-6.9200, 107.6100],
    lokasiSpesifik: 'Sepanjang Jalan Merdeka - Sudirman',
    deskripsi: 'Melakukan pendataan dan penertiban reklame liar di sepanjang jalan protokol.',
    status: 'VERIFIKASI_SUBBAGIAN',
    workflow: [
      {
        stage: 'DRAFT',
        label: 'Diajukan',
        actor: 'Siti Rahmawati, S.H.',
        tanggal: '2026-08-29 14:00',
        status: 'COMPLETED'
      },
      {
        stage: 'VERIFIKASI_SUBBAGIAN',
        label: 'Sedang Diverifikasi',
        actor: 'Admin Penertiban',
        tanggal: '2026-08-30 10:30',
        status: 'IN_PROGRESS'
      }
    ]
  },
  {
    id: 'AJ-003',
    nomorSurat: '094/03/AJ-KEPEG/2026',
    uraianKegiatan: 'Pelatihan Administrator Jaringan',
    pengaju: dummyPegawaiList[6], // Arnest
    pegawaiDitugaskan: [dummyPegawaiList[6]],
    unitKerja: 'Fastingkom',
    tanggalMulai: '2026-08-20',
    tanggalSelesai: '2026-08-25',
    tempat: 'Hotel Aston',
    koordinat: [-6.9175, 107.6191],
    lokasiSpesifik: 'Grand Ballroom',
    deskripsi: 'Mengikuti pelatihan sertifikasi Mikrotik tingkat lanjut.',
    status: 'SURAT_TERBIT',
    linkSurat: '#',
    workflow: [
      {
        stage: 'DRAFT',
        label: 'Diajukan',
        actor: 'Arnest, S.Kom.',
        tanggal: '2026-08-15 08:00',
        status: 'COMPLETED'
      },
      {
        stage: 'VERIFIKASI_SUBBAGIAN',
        label: 'Terverifikasi',
        actor: 'Admin IT',
        tanggal: '2026-08-15 13:00',
        status: 'COMPLETED'
      },
      {
        stage: 'PERSETUJUAN_PIMPINAN',
        label: 'Disetujui Pimpinan',
        actor: 'Kepala Fastingkom',
        tanggal: '2026-08-16 09:00',
        status: 'COMPLETED'
      },
      {
        stage: 'SURAT_TERBIT',
        label: 'Surat Terbit',
        actor: 'Sistem',
        tanggal: '2026-08-16 09:05',
        status: 'COMPLETED'
      }
    ]
  }
];

// Data Rekap Presensi Pribadi Taryadi
export const dummyPresensiPribadi: RekapPresensiPribadi = {
  totalHariKerja: 0,
  totalHadir: 0,
  totalIzin: 0,
  totalSakit: 0,
  totalAlfa: 0,
  totalTerlambat: 0,
  totalJamKerja: 0,
  persentaseKehadiran: 0,
  tukin: {
    periodeBulan: 'Bulan Ini',
    tunjanganDasar: 0,
    totalPotonganPersen: 0,
    totalPotonganNominal: 0,
    tunjanganDiterima: 0,
    rincianPotongan: [],
  },
};

// Data Detail Presensi Pribadi (Log Harian Taryadi)
export const dummyRiwayatPresensiPribadi: PresensiItem[] = [];

// Tambahan data untuk memastikan setiap unit memiliki contoh seluruh status presensi.
export const dummyPresensiStatusTambahan: PresensiItem[] = [];

// Data Presensi Pegawai Lainnya (Tabel Lengkap & Kalender Monitoring)
export const dummyPresensiPegawaiLain: PresensiItem[] = [];

// Data Lokasi Pemetaan Penugasan Pegawai (Map Markers)
export const dummyLokasiPenugasan: LokasiPenugasanPegawai[] = [];

// Helper warna per Unit Kerja
export const UNIT_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'RBI': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-500', hex: '#6366f1' },
  'Fastingkom': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-500', hex: '#10b981' },
  'Kepeg': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', hex: '#3b82f6' },
  'PM': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-500', hex: '#f59e0b' },
};

export const getUnitColor = (unit: string) => {
  if (UNIT_COLORS[unit]) return UNIT_COLORS[unit];
  // Fallback color for dynamic departments
  return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-500', hex: '#64748b' };
};
