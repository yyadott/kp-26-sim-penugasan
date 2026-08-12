import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { TugasPage } from '@/pages/admin/TugasPage';
import { BuatTugasPage } from '@/pages/admin/BuatTugasPage';
import { EditTugasPage } from '@/pages/admin/EditTugasPage';
import { UploadSuratPage } from '@/pages/admin/UploadSuratPage';
import { MonitoringTugasPage } from '@/pages/admin/MonitoringTugasPage';
import { PemetaanPage } from '@/pages/admin/PemetaanPage';
import { NotifikasiPage } from '@/pages/admin/NotifikasiPage';
import { ProfilePage } from '@/pages/admin/ProfilePage';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />

      <Route path="tugas" element={<TugasPage />} />
      <Route path="tugas/buat" element={<BuatTugasPage />} />
      <Route path="tugas/edit" element={<EditTugasPage />} />
      <Route path="tugas/upload-surat" element={<UploadSuratPage />} />
      <Route path="tugas/monitoring" element={<MonitoringTugasPage />} />

      <Route path="pemetaan" element={<PemetaanPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
