import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/approval/DashboardPage';
import { ApprovalTugasPage } from '@/pages/approval/ApprovalTugasPage';
import { SuratTugasPage } from '@/pages/approval/SuratTugasPage';
import { RiwayatApprovalPage } from '@/pages/approval/RiwayatApprovalPage';
import { NotifikasiPage } from '@/pages/approval/NotifikasiPage';
import { ProfilePage } from '@/pages/approval/ProfilePage';

export const ApprovalRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="approval-tugas" element={<ApprovalTugasPage />} />
      <Route path="surat-tugas" element={<SuratTugasPage />} />
      <Route path="riwayat-approval" element={<RiwayatApprovalPage />} />
      <Route path="notifikasi" element={<NotifikasiPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};
