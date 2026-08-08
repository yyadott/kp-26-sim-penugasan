import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    // Fallback if rendered outside AuthProvider
    return {
      user: null,
      isAuthenticated: false,
      login: async () => ({ success: false, message: 'Layanan autentikasi tidak tersedia.' }),
      updateProfile: () => {},
      logout: () => {},
    };
  }

  return context;
};
