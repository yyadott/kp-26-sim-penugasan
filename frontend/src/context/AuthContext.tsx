import React, { createContext, useState, useEffect } from 'react';
import type { Pegawai } from '@/types';
import { dummyPegawaiList } from '@/data/dummyData';
import apiClient from '@/api/client';

export interface AuthContextType {
  user: Pegawai | null;
  isAuthenticated: boolean;
  login: (usernameOrNip: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateCredentials: (data: { username: string; currentPassword: string; newPassword: string }) => { success: boolean; message?: string };
  updateProfilePicture: (dataUrl: string) => void;
  getDemoCredentials: () => { username: string; password: string };
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sim_penugasan_user';
const CREDENTIALS_STORAGE_KEY = 'sim_penugasan_credentials';
const DEFAULT_CREDENTIALS = { username: 'yadiyudi', password: 'password123' };

const getCredentials = () => {
  try {
    const saved = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    return saved ? { ...DEFAULT_CREDENTIALS, ...JSON.parse(saved) } : DEFAULT_CREDENTIALS;
  } catch {
    return DEFAULT_CREDENTIALS;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Pegawai | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === 'peg-07') parsed.nama = 'Arnest, S.Kom.';
        if (!parsed.fotoAvatar || parsed.fotoAvatar.includes('unsplash') || parsed.id === 'peg-01') {
          parsed.fotoAvatar = `${import.meta.env.BASE_URL}pp-navbar-2.jpg`;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    // Pengunjung baru harus melewati halaman login terlebih dahulu.
    return null;
  });

  const isAuthenticated = !!user;

  const login = async (usernameOrNip: string, password: string) => {
    const cleanInput = usernameOrNip.trim().toLowerCase();
    
    // Quick demo overrides (bypass API for instant demo accounts)
    if (['superadmin', 'approval', 'admin', 'user'].includes(cleanInput)) {
      let defaultUser;
      if (cleanInput === 'superadmin') {
        defaultUser = { ...dummyPegawaiList[0], username: cleanInput, role: 'SUPER_ADMIN' };
      } else if (cleanInput === 'admin') {
        defaultUser = { ...dummyPegawaiList[7], username: cleanInput, role: 'ADMIN' };
      } else if (cleanInput === 'user') {
        defaultUser = { ...dummyPegawaiList[6], username: cleanInput, role: 'PEGAWAI' };
      } else {
        defaultUser = { ...dummyPegawaiList[0], username: cleanInput, role: 'APPROVAL' };
      }
      
      setUser(defaultUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      return { success: true };
    }

    try {
      // Import apiClient dynamically to avoid circular dependencies if any, or just import it at top
      // Wait, we can import it at the top of the file.
      const res = await apiClient.post('/auth/login', { 
        email: cleanInput, 
        password 
      });
      
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data.user));
        // You might want to save the token in localStorage too
        if (res.data.token) {
          localStorage.setItem('sim_penugasan_token', res.data.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Respons server tidak valid.' };
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        return { success: false, message: error.response.data.message || 'Kredensial tidak valid.' };
      }
      return { success: false, message: 'Gagal menghubungi server database.' };
    }
  };

  const updateCredentials: AuthContextType['updateCredentials'] = ({ username, currentPassword, newPassword }) => {
    const trimmedUsername = username.trim();
    const credentials = getCredentials();

    if (!trimmedUsername) return { success: false, message: 'Username wajib diisi.' };
    if (currentPassword !== credentials.password) return { success: false, message: 'Password lama tidak sesuai.' };
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'Password baru minimal 6 karakter.' };

    const nextCredentials = { username: trimmedUsername, password: newPassword };
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(nextCredentials));
    setUser((currentUser) => currentUser ? { ...currentUser, username: trimmedUsername } : currentUser);
    return { success: true, message: 'Username dan password berhasil diperbarui.' };
  };

  const updateProfilePicture = (dataUrl: string) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updatedUser = { ...currentUser, fotoAvatar: dataUrl };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const getDemoCredentials = () => getCredentials();

  const logout = () => {
    setUser(null);
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, updateCredentials, updateProfilePicture, getDemoCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
