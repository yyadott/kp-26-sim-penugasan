import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { UserLayout } from '@/layouts/UserLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { SuperAdminRoutes } from '@/routes/SuperAdminRoutes';
import { AdminRoutes } from '@/routes/AdminRoutes';
import { ApprovalRoutes } from '@/routes/ApprovalRoutes';
import { UserRoutes } from '@/routes/UserRoutes';

const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const normalizedRole = user?.role?.toUpperCase() || 'USER';

  if (normalizedRole === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
  if (normalizedRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (normalizedRole === 'APPROVAL') return <Navigate to="/approval/dashboard" replace />;
  return <Navigate to="/pegawai/dashboard" replace />;
};

const RoleRedirect = ({ to }: { to: string }) => {
  const { user } = useAuth();
  const normalizedRole = user?.role?.toUpperCase() || 'USER';

  if (normalizedRole === 'SUPER_ADMIN') return <Navigate to={`/super-admin${to}`} replace />;
  if (normalizedRole === 'ADMIN') return <Navigate to={`/admin${to}`} replace />;
  if (normalizedRole === 'APPROVAL') return <Navigate to={`/approval${to}`} replace />;
  return <Navigate to={`/pegawai${to}`} replace />;
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
        path="/super-admin/*"
        element={
          <ProtectedRoute requiredRole="super-admin">
            <AdminLayout>
              <SuperAdminRoutes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

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
        path="/approval/*"
        element={
          <ProtectedRoute requiredRole="approval">
            <AdminLayout>
              <ApprovalRoutes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pegawai/*"
        element={
          <ProtectedRoute requiredRole="pegawai">
            <UserLayout>
              <UserRoutes />
            </UserLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
};
