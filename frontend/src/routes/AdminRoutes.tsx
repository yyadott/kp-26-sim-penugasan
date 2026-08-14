import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AnggotaPage } from '@/pages/admin/AnggotaPage';
import { AbsensiPage } from '@/pages/admin/AbsensiPage';
import { TugasPage } from '@/pages/admin/TugasPage';
import { PemetaanPage } from '@/pages/admin/PemetaanPage';
import { SimpananPage } from '@/pages/admin/SimpananPage';
import { NotifikasiPage } from '@/pages/admin/NotifikasiPage';
import { ProfilePage } from '@/pages/admin/ProfilePage';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="anggota" element={<AnggotaPage />} />
      <Route path="absensi" element={<AbsensiPage />} />
      <Route path="tugas" element={<TugasPage />} />
      <Route path="pemetaan" element={<PemetaanPage />} />
      <Route path="simpanan" element={<SimpananPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
