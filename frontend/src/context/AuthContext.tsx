import React, { createContext, useState, useEffect } from 'react';
import type { Pegawai } from '@/types';
import { dummyPegawaiList } from '@/data/dummyData';

export interface AuthContextType {
  user: Pegawai | null;
  isAuthenticated: boolean;
  login: (usernameOrNip: string, password: string) => { success: boolean; message?: string };
  updateCredentials: (data: { username: string; currentPassword: string; newPassword: string }) => { success: boolean; message?: string };
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

  const login = (usernameOrNip: string, password: string) => {
    const cleanInput = usernameOrNip.trim().toLowerCase();
    const credentials = getCredentials();
    const isCustomUsername = cleanInput === credentials.username.toLowerCase();

    if (isCustomUsername && password !== credentials.password) {
      return { success: false, message: 'Password tidak sesuai.' };
    }

    // Find matching user by NIP, email prefix, or name
    const foundUser = dummyPegawaiList.find((p) => {
      const nipMatch = p.nip.toLowerCase() === cleanInput;
      const emailPrefixMatch = p.email?.toLowerCase().split('@')[0] === cleanInput;
      const nameMatch = p.nama.toLowerCase().includes(cleanInput);
      const usernameMatch = p.username?.toLowerCase() === cleanInput;
      return nipMatch || emailPrefixMatch || nameMatch || usernameMatch;
    });

    if (foundUser) {
      const authenticatedUser = { ...foundUser, username: foundUser.username || credentials.username };
      setUser(authenticatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      return { success: true };
    } else {
      // Fallback: quick test logins
      if (['superadmin', 'approval', 'admin', 'user', ''].includes(cleanInput) || isCustomUsername) {
        const defaultUser = { ...dummyPegawaiList[0], username: cleanInput || credentials.username };
        if (cleanInput === 'superadmin') defaultUser.role = 'SUPER_ADMIN';
        else if (cleanInput === 'approval') defaultUser.role = 'APPROVAL';
        else if (cleanInput === 'admin') defaultUser.role = 'ADMIN';
        else if (cleanInput === 'user') defaultUser.role = 'USER';
        else defaultUser.role = 'SUPER_ADMIN'; // default to superadmin
        
        setUser(defaultUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
        return { success: true };
      }
      return { success: false, message: 'Username / NIP tidak ditemukan dalam database.' };
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, updateCredentials, getDemoCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
