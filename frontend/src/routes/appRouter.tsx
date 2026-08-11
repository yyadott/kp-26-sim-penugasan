import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/superadmin/DashboardPage';
import { AbsensiPage } from '@/pages/superadmin/AbsensiPage';
import { TugasPage } from '@/pages/superadmin/TugasPage';
import { PemetaanPage } from '@/pages/superadmin/PemetaanPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ProfilePage } from '@/pages/superadmin/ProfilePage';
import { AkunPage } from '@/pages/superadmin/AkunPage';
import { PokjaPage } from '@/pages/superadmin/PokjaPage';
import { DraftAjuanPage } from '@/pages/operator/DraftAjuanPage';
import { ProsesAjuanPage } from '@/pages/operator/ProsesAjuanPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserDashboard } from '@/pages/user/UserDashboard';
import { AjuanPegawaiPage } from '@/pages/superadmin/AjuanPegawaiPage';
import { RekapPenugasanPage } from '@/pages/superadmin/RekapPenugasanPage';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Route Halaman Utama */}
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tugas" element={<ProtectedRoute><TugasPage /></ProtectedRoute>} />
      <Route path="/absensi" element={<ProtectedRoute><AbsensiPage /></ProtectedRoute>} />
      <Route path="/pemetaan" element={<ProtectedRoute><PemetaanPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/akun" element={<ProtectedRoute><AkunPage /></ProtectedRoute>} />
      <Route path="/pokja" element={<ProtectedRoute><PokjaPage /></ProtectedRoute>} />
      <Route path="/operator/draft-ajuan" element={<ProtectedRoute><DraftAjuanPage /></ProtectedRoute>} />
      <Route path="/operator/proses-ajuan" element={<ProtectedRoute><ProsesAjuanPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/ajuan" element={<ProtectedRoute><AjuanPegawaiPage /></ProtectedRoute>} />
      <Route path="/admin/penugasan" element={<ProtectedRoute><RekapPenugasanPage /></ProtectedRoute>} />
      <Route path="/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
