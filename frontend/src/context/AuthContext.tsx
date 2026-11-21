import React, { createContext, useState, useEffect } from 'react';
import type { Pegawai } from '@/types';
import { dummyPegawaiList } from '@/data/dummyData';
import apiClient from '@/api/client';

export interface AuthContextType {
  user: Pegawai | null;
  isAuthenticated: boolean;
  login: (usernameOrNip: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateCredentials: (data: { username: string; email?: string; currentPassword: string; newPassword: string }) => { success: boolean; message?: string };
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
    const saved = sessionStorage.getItem(CREDENTIALS_STORAGE_KEY);
    return saved ? { ...DEFAULT_CREDENTIALS, ...JSON.parse(saved) } : DEFAULT_CREDENTIALS;
  } catch {
    return DEFAULT_CREDENTIALS;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Pegawai | null>(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
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
    const credentials = getCredentials();

    if (!cleanInput || !password) {
      return { success: false, message: 'Username/NIP dan Password wajib diisi.' };
    }

    const isCustomUsername = cleanInput === credentials.username.toLowerCase();
    const isValidDemoPassword =
      password === credentials.password || password === DEFAULT_CREDENTIALS.password;

    // 1. Quick demo accounts & custom username (wajib verifikasi password)
    if (['superadmin', 'approval', 'admin', 'user'].includes(cleanInput) || isCustomUsername) {
      if (!isValidDemoPassword) {
        return {
          success: false,
          message: 'Username/NIP atau Password yang Anda masukkan salah!',
        };
      }

      let defaultUser: Pegawai;
      if (cleanInput === 'superadmin') {
        defaultUser = { ...dummyPegawaiList[0], username: cleanInput, role: 'SUPER_ADMIN' };
      } else if (cleanInput === 'admin') {
        defaultUser = { ...dummyPegawaiList[7], username: cleanInput, role: 'ADMIN' };
      } else if (cleanInput === 'user') {
        defaultUser = { ...dummyPegawaiList[6], username: cleanInput, role: 'PEGAWAI' };
      } else if (cleanInput === 'approval') {
        defaultUser = { ...dummyPegawaiList[0], username: cleanInput, role: 'APPROVAL' };
      } else {
        defaultUser = { ...dummyPegawaiList[0], username: credentials.username, role: 'SUPER_ADMIN' };
      }

      setUser(defaultUser);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      return { success: true };
    }

    // 2. Autentikasi ke server database (/api/auth/login)
    try {
      const res = await apiClient.post('/auth/login', {
        email: cleanInput,
        nip: cleanInput,
        password,
      });

      if (res.data && res.data.user) {
        setUser(res.data.user);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data.user));
        if (res.data.token) {
          sessionStorage.setItem('sim_penugasan_token', res.data.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Username/NIP atau Password yang Anda masukkan salah!' };
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        return {
          success: false,
          message: error.response.data?.message || 'Username/NIP atau Password yang Anda masukkan salah!',
        };
      }

      // 3. Fallback jika server backend sedang tidak aktif: cek kecocokan eksak pada dummyPegawaiList + password
      const foundOfflineUser = dummyPegawaiList.find((p) => {
        const nipMatch = p.nip.toLowerCase() === cleanInput;
        const emailMatch = p.email?.toLowerCase() === cleanInput;
        const emailPrefixMatch = p.email?.toLowerCase().split('@')[0] === cleanInput;
        const usernameMatch = p.username?.toLowerCase() === cleanInput;
        return nipMatch || emailMatch || emailPrefixMatch || usernameMatch;
      });

      if (foundOfflineUser && isValidDemoPassword) {
        setUser(foundOfflineUser);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundOfflineUser));
        return { success: true };
      }

      return {
        success: false,
        message: 'Username/NIP atau Password yang Anda masukkan salah!',
      };
    }
  };

  const updateCredentials: AuthContextType['updateCredentials'] = ({ username, email, currentPassword, newPassword }) => {
    const trimmedUsername = username.trim();
    const credentials = getCredentials();

    if (!trimmedUsername) return { success: false, message: 'Username wajib diisi.' };
    if (currentPassword !== credentials.password) return { success: false, message: 'Password lama tidak sesuai.' };
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'Password baru minimal 6 karakter.' };

    const nextCredentials = {
      username: trimmedUsername,
      ...(email ? { email: email.trim() } : {}),
      password: newPassword,
    };
    sessionStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(nextCredentials));
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, username: trimmedUsername, ...(email ? { email: email.trim() } : {}) }
        : currentUser
    );
    return { success: true, message: 'Username dan password berhasil diperbarui.' };
  };

  const updateProfilePicture = (dataUrl: string) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updatedUser = { ...currentUser, fotoAvatar: dataUrl };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const getDemoCredentials = () => getCredentials();

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('sim_penugasan_token');
  };

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, updateCredentials, updateProfilePicture, getDemoCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
