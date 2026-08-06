import React, { createContext, useState, useEffect } from 'react';
import type { Pegawai } from '@/types';
import { simPenugasanApi } from '@/api/simPenugasanApi';

export interface AuthContextType {
  user: Pegawai | null;
  isAuthenticated: boolean;
  login: (usernameOrNip: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sim_penugasan_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Pegawai | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
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

  const login = async (usernameOrNip: string, password: string) => {
    try {
      const { token, user } = await simPenugasanApi.login(usernameOrNip, password);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Tidak dapat terhubung ke server.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
