import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/super-admin/DashboardPage';
import { AdminPage } from '@/pages/super-admin/AdminPage';
import { ApprovalPage } from '@/pages/super-admin/ApprovalPage';
import { UserPage } from '@/pages/super-admin/UserPage';
import { BidangPage } from '@/pages/super-admin/BidangPage';
import { AbsensiPage } from '@/pages/super-admin/AbsensiPage';
import { TugasPage } from '@/pages/super-admin/TugasPage';
import { NotifikasiPage } from '@/pages/super-admin/NotifikasiPage';
import { ProfilePage } from '@/pages/super-admin/ProfilePage';

export const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="admin" element={<AdminPage />} />
      <Route path="approval" element={<ApprovalPage />} />
      <Route path="user" element={<UserPage />} />
      <Route path="bidang" element={<BidangPage />} />
      <Route path="absensi" element={<AbsensiPage />} />
      <Route path="tugas" element={<TugasPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
