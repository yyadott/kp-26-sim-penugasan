import React, { createContext, useState, useEffect } from 'react';
import type { Pegawai } from '@/types';
import { axiosInstance } from '@/api/axiosInstance';

export interface AuthContextType {
  user: Pegawai | null;
  isAuthenticated: boolean;
  login: (usernameOrNip: string, password: string, captchaId: string, captchaAnswer: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (profile: Pick<Pegawai, 'nama' | 'email' | 'jabatan'>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sim_penugasan_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Pegawai | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const token = localStorage.getItem('token');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        if (!parsed.fotoAvatar || parsed.fotoAvatar.includes('unsplash') || parsed.id === 'peg-01') {
          parsed.fotoAvatar = `${import.meta.env.BASE_URL}pp-navbar-2.jpg`;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const isAuthenticated = !!user;

  const login = async (username: string, password: string, captchaId: string, captchaAnswer: string) => {
    try {
      const { data } = await axiosInstance.post<{ token: string; user: Pegawai }>('/auth/login', { username, password, captchaId, captchaAnswer });
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      return { success: false, message: message || 'Tidak dapat masuk. Silakan coba lagi.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = (profile: Pick<Pegawai, 'nama' | 'email' | 'jabatan'>) => {
    setUser((currentUser) => (currentUser ? { ...currentUser, ...profile } : currentUser));
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
