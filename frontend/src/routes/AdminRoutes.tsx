import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AnggotaPage } from '@/pages/admin/AnggotaPage';
import { TambahAnggotaPage } from '@/pages/admin/TambahAnggotaPage';
import { EditAnggotaPage } from '@/pages/admin/EditAnggotaPage';
import { HapusAnggotaPage } from '@/pages/admin/HapusAnggotaPage';
import { AbsensiPage } from '@/pages/admin/AbsensiPage';
import { LihatAbsensiPage } from '@/pages/admin/LihatAbsensiPage';
import { VerifikasiAbsensiPage } from '@/pages/admin/VerifikasiAbsensiPage';
import { RekapAbsensiPage } from '@/pages/admin/RekapAbsensiPage';
import { TugasPage } from '@/pages/admin/TugasPage';
import { BuatTugasPage } from '@/pages/admin/BuatTugasPage';
import { EditTugasPage } from '@/pages/admin/EditTugasPage';
import { UploadSuratPage } from '@/pages/admin/UploadSuratPage';
import { MonitoringTugasPage } from '@/pages/admin/MonitoringTugasPage';
import { PemetaanPage } from '@/pages/admin/PemetaanPage';
import { SimpananPage } from '@/pages/admin/SimpananPage';
import { NotifikasiPage } from '@/pages/admin/NotifikasiPage';
import { LaporanPage } from '@/pages/admin/LaporanPage';
import { ProfilePage } from '@/pages/admin/ProfilePage';

export const AdminRoutes = () => {
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
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
