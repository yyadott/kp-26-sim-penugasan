export type UnitKerjaType =
  
  | 'Fastingkom'
  | 'Kepeg'
  | 'PM';

// Types untuk Pegawai
export interface Pegawai {
  db_id?: number;
  id: string;
  nama: string;
  nip: string;
  unitKerja: UnitKerjaType;
  jabatan: string;
  golongan?: string;
  pangkat?: string;
  fotoAvatar?: string;
  email?: string;
  username?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'PEGAWAI' | 'APPROVAL' | 'USER' | 'Super Admin' | 'Pegawai' | string;
  is_active?: boolean;
  totalTugas?: number;
}

// History / Workflow Timeline item untuk Surat Tugas
export interface WorkflowStep {
  stage: 'DRAFT' | 'VERIFIKASI_SUBBAGIAN' | 'PERSETUJUAN_PIMPINAN' | 'SURAT_TERBIT';
  label: string;
  actor: string;
  tanggal?: string;
  catatan?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';
}

// Ajuan Surat Tugas & Draft Penugasan
export interface AjuanSuratTugas {
  id: string;
  nomorSurat: string;
  uraianKegiatan: string;
  pengaju: Pegawai;
  pegawaiDitugaskan: Pegawai[];
  unitKerja: UnitKerjaType;
  tanggalMulai: string;
  tanggalSelesai: string;
  tempat: string;
  koordinat: [number, number]; // [latitude, longitude]
  lokasiSpesifik?: string;
  deskripsi: string;
  status: 'DRAFT' | 'VERIFIKASI_SUBBAGIAN' | 'PERSETUJUAN_PIMPINAN' | 'SURAT_TERBIT' | 'DITOLAK';
  linkSurat?: string;
  biaya?: string;
  workflow: WorkflowStep[];
}

// Types untuk Fitur Absensi / Presensi
export interface PresensiItem {
  id: string;
  pegawaiId: string;
  nama: string;
  nip: string;
  unitKerja: UnitKerjaType;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string; // HH:mm
  lokasiPresensiMasuk: string;
  koordinatMasuk?: [number, number];
  jamKeluar?: string; // HH:mm
  lokasiPresensiKeluar?: string;
  koordinatKeluar?: [number, number];
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA' | 'TERLAMBAT';
  keterangan?: string;
  terlambatMenit?: number;
}

// Rekap Tunjangan Kinerja (Tukin) Presensi Pribadi
export interface RincianPotonganTukin {
  alasan: string;
  tanggal: string;
  persenPotongan: number;
  nominalPotongan: number;
}

export interface RekapTukinPribadi {
  periodeBulan: string;
  tunjanganDasar: number; // Rp. Nominal Tukin Full
  totalPotonganPersen: number;
  totalPotonganNominal: number;
  tunjanganDiterima: number;
  rincianPotongan: RincianPotonganTukin[];
}

export interface RekapPresensiPribadi {
  totalHariKerja: number;
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlfa: number;
  totalTerlambat: number;
  totalJamKerja: number;
  persentaseKehadiran: number;
  tukin: RekapTukinPribadi;
}

// Data Tempat untuk Pemetaan
export interface LokasiPenugasanPegawai {
  id: string;
  suratTugasId: string;
  nomorSurat: string;
  uraianKegiatan: string;
  pegawai: Pegawai;
  unitKerja: UnitKerjaType;
  lokasi: string;
  namaLokasi?: string; // Nama lengkap lokasi untuk label boundary (e.g. "Universitas Jenderal Achmad Yani")
  alamatLengkap: string;
  koordinat: [number, number];
  batasWilayah?: [number, number][]; // Polygon boundary coordinates [[lat, lng], ...] — garis merah ala Wikipedia
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'AKTIF' | 'MENDATANG' | 'SELESAI';
  markerType?: 'approvedAjuan';
}
