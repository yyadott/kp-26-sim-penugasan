import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AnggotaLayout } from '@/layouts/AnggotaLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoutes } from '@/routes/AdminRoutes';
import { AnggotaRoutes } from '@/routes/AnggotaRoutes';

const HomeRedirect = () => {
  const { user } = useAuth();
  const normalizedRole = user?.role?.toUpperCase() || 'PEGAWAI';
  const isAdmin = normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'ADMIN';

  return <Navigate to={isAdmin ? '/admin/dashboard' : '/anggota/dashboard'} replace />;
};

const RoleRedirect = ({ to }: { to: string }) => {
  const { user } = useAuth();
  const normalizedRole = user?.role?.toUpperCase() || 'PEGAWAI';
  const isAdmin = normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'ADMIN';

  return <Navigate to={isAdmin ? `/admin${to}` : `/anggota${to}`} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/auth/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />

      <Route path="/dashboard" element={<HomeRedirect />} />
      <Route path="/tugas" element={<ProtectedRoute><RoleRedirect to="/tugas" /></ProtectedRoute>} />
      <Route path="/absensi" element={<ProtectedRoute><RoleRedirect to="/absensi" /></ProtectedRoute>} />
      <Route path="/pemetaan" element={<ProtectedRoute><RoleRedirect to="/pemetaan" /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><RoleRedirect to="/profile" /></ProtectedRoute>} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminRoutes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/anggota/*"
        element={
          <ProtectedRoute requiredRole="anggota">
            <AnggotaLayout>
              <AnggotaRoutes />
            </AnggotaLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
};
