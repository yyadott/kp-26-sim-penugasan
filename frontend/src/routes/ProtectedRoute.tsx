import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

type RequiredRole = 'admin' | 'anggota';

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
  const isAdmin = normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'ADMIN';

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/anggota/dashboard" replace />;
  }

  if (requiredRole === 'anggota' && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
