import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

type RequiredRole = 'super-admin' | 'admin' | 'pegawai' | 'approval' | 'user';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: RequiredRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const normalizedRole = user?.role?.toUpperCase() || 'PEGAWAI';
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';
  const isAdmin = normalizedRole === 'ADMIN';
  const isPegawai = normalizedRole === 'PEGAWAI';

  if (requiredRole === 'super-admin' && !isSuperAdmin) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/pegawai/dashboard"} replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to={isSuperAdmin ? "/super-admin/dashboard" : "/pegawai/dashboard"} replace />;
  }

  if (requiredRole === 'pegawai' && !isPegawai) {
    return <Navigate to={isSuperAdmin ? "/super-admin/dashboard" : "/admin/dashboard"} replace />;
  }

  return <>{children}</>;
};
