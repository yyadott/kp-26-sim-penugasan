import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthContext';
import { dummyPegawaiList } from '@/data/dummyData';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    // Fallback if rendered outside AuthProvider
    return {
      user: dummyPegawaiList[0],
      isAuthenticated: true,
      login: () => ({ success: true }),
      logout: () => {},
    };
  }

  return context;
};