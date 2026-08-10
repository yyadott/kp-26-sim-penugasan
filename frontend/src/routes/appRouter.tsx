import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { AbsensiPage } from '@/pages/AbsensiPage';
import { TugasPage } from '@/pages/TugasPage';
import { PemetaanPage } from '@/pages/PemetaanPage';
import { LoginPage } from '@/pages/LoginPage';
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
      <Route path="/login" element={<LoginPage />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
