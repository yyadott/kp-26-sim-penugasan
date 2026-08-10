export type UnitKerjaType =
  | 'RBI'
  | 'Fastingkom'
  | 'Kepeg'
  | 'PM';

// Types untuk Pegawai
export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  unitKerja: UnitKerjaType;
  jabatan: string;
  fotoAvatar?: string;
  email?: string;
  role?: 'ADMIN' | 'PEGAWAI';
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
  perihal: string;
  pengaju: Pegawai;
  pegawaiDitugaskan: Pegawai[];
  unitKerja: UnitKerjaType;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasiPenugasan: string;
  koordinat: [number, number]; // [latitude, longitude]
  lokasiSpesifik?: string;
  deskripsi: string;
  status: 'DRAFT' | 'VERIFIKASI_SUBBAGIAN' | 'PERSETUJUAN_PIMPINAN' | 'SURAT_TERBIT' | 'DITOLAK';
  fileDraftUrl?: string;
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

// Data Lokasi Penugasan untuk Pemetaan
export interface LokasiPenugasanPegawai {
  id: string;
  suratTugasId: string;
  nomorSurat: string;
  perihal: string;
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
