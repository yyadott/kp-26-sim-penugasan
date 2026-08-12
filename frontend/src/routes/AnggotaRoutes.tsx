import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/anggota/DashboardPage';
import { TugasSayaPage } from '@/pages/anggota/TugasSayaPage';
import { UploadSuratPage } from '@/pages/anggota/UploadSuratPage';
import { LaporanTugasPage } from '@/pages/anggota/LaporanTugasPage';
import { AbsensiPage } from '@/pages/anggota/AbsensiPage';
import { CutiPage } from '@/pages/anggota/CutiPage';
import { AbsensiMenuPage } from '@/pages/anggota/AbsensiMenuPage';
import { SimpananPage } from '@/pages/anggota/SimpananPage';
import { NotifikasiPage } from '@/pages/anggota/NotifikasiPage';
import { ProfilePage } from '@/pages/anggota/ProfilePage';

export const AnggotaRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="tugas-saya" element={<Navigate to="tugas/progres" replace />} />
      <Route path="upload-surat" element={<Navigate to="tugas/pengajuan" replace />} />
      <Route path="tugas/pengajuan" element={<UploadSuratPage />} />
      <Route path="tugas/progres" element={<TugasSayaPage />} />
      <Route path="tugas/laporan" element={<LaporanTugasPage />} />
      <Route path="absensi" element={<AbsensiMenuPage />} />
      <Route path="absensi/kehadiran" element={<AbsensiPage />} />
      <Route path="absensi/cuti" element={<CutiPage />} />
      <Route path="simpanan" element={<SimpananPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
