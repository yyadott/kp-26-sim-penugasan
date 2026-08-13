import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/super-admin/DashboardPage';
import { AnggotaPage } from '@/pages/super-admin/AnggotaPage';
import { TambahAnggotaPage } from '@/pages/super-admin/TambahAnggotaPage';
import { EditAnggotaPage } from '@/pages/super-admin/EditAnggotaPage';
import { HapusAnggotaPage } from '@/pages/super-admin/HapusAnggotaPage';
import { AbsensiPage } from '@/pages/super-admin/AbsensiPage';
import { LihatAbsensiPage } from '@/pages/super-admin/LihatAbsensiPage';
import { VerifikasiAbsensiPage } from '@/pages/super-admin/VerifikasiAbsensiPage';
import { RekapAbsensiPage } from '@/pages/super-admin/RekapAbsensiPage';
import { TugasPage } from '@/pages/super-admin/TugasPage';
import { BuatTugasPage } from '@/pages/super-admin/BuatTugasPage';
import { EditTugasPage } from '@/pages/super-admin/EditTugasPage';
import { UploadSuratPage } from '@/pages/super-admin/UploadSuratPage';
import { MonitoringTugasPage } from '@/pages/super-admin/MonitoringTugasPage';
import { PemetaanPage } from '@/pages/super-admin/PemetaanPage';
import { SimpananPage } from '@/pages/super-admin/SimpananPage';
import { NotifikasiPage } from '@/pages/super-admin/NotifikasiPage';
import { LaporanPage } from '@/pages/super-admin/LaporanPage';
import { ProfilePage } from '@/pages/super-admin/ProfilePage';
import { AkunPage } from '@/pages/super-admin/AkunPage';
import { PokjaPage } from '@/pages/super-admin/PokjaPage';
import { AjuanPegawaiPage } from '@/pages/super-admin/AjuanPegawaiPage';
import { RekapPenugasanPage } from '@/pages/super-admin/RekapPenugasanPage';

export const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />

      <Route path="anggota" element={<AnggotaPage />} />
      <Route path="anggota/tambah" element={<TambahAnggotaPage />} />
      <Route path="anggota/edit" element={<EditAnggotaPage />} />
      <Route path="anggota/hapus" element={<HapusAnggotaPage />} />

      <Route path="absensi" element={<AbsensiPage />} />
      <Route path="absensi/lihat" element={<LihatAbsensiPage />} />
      <Route path="absensi/verifikasi" element={<VerifikasiAbsensiPage />} />
      <Route path="absensi/rekap" element={<RekapAbsensiPage />} />

      <Route path="tugas" element={<TugasPage />} />
      <Route path="tugas/buat" element={<BuatTugasPage />} />
      <Route path="tugas/edit" element={<EditTugasPage />} />
      <Route path="tugas/upload-surat" element={<UploadSuratPage />} />
      <Route path="tugas/monitoring" element={<MonitoringTugasPage />} />

      <Route path="pemetaan" element={<PemetaanPage />} />
      <Route path="simpanan" element={<SimpananPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="laporan" element={<LaporanPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="akun" element={<AkunPage />} />
      <Route path="pokja" element={<PokjaPage />} />
      <Route path="ajuan-pegawai" element={<AjuanPegawaiPage />} />
      <Route path="rekap-penugasan" element={<RekapPenugasanPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
