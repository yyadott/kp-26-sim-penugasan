import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/user/DashboardPage';
import { TugasPage } from '@/pages/user/TugasPage';
import { UploadSuratPage } from '@/pages/user/UploadSuratPage';
import { StatusApprovalPage } from '@/pages/user/StatusApprovalPage';
import { AbsensiPage } from '@/pages/user/AbsensiPage';
import { NotifikasiPage } from '@/pages/user/NotifikasiPage';
import { SimpananPage } from '@/pages/user/SimpananPage';
import { ProfilePage } from '@/pages/user/ProfilePage';

export const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="tugas" element={<TugasPage />} />
      <Route path="upload-surat" element={<UploadSuratPage />} />
      <Route path="status-approval" element={<StatusApprovalPage />} />
      <Route path="absensi" element={<AbsensiPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="simpanan" element={<SimpananPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
