import React, { createContext, useState, useEffect } from 'react';
import type { Pegawai } from '@/types';
import { dummyPegawaiList } from '@/data/dummyData';

export interface AuthContextType {
  user: Pegawai | null;
  isAuthenticated: boolean;
  login: (usernameOrNip: string, password: string) => { success: boolean; message?: string };
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
    // Default logged in as Taryadi for initial view
    return dummyPegawaiList[0];
  });

  const isAuthenticated = !!user;

  const login = (usernameOrNip: string, _password: string) => {
    const cleanInput = usernameOrNip.trim().toLowerCase();

    // Find matching user by NIP, email prefix, or name
    const foundUser = dummyPegawaiList.find((p) => {
      const nipMatch = p.nip.toLowerCase() === cleanInput;
      const emailPrefixMatch = p.email?.toLowerCase().split('@')[0] === cleanInput;
      const nameMatch = p.nama.toLowerCase().includes(cleanInput);
      return nipMatch || emailPrefixMatch || nameMatch;
    });

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
      return { success: true };
    } else {
      // Fallback: if username is 'admin' or 'taryadi' or any input, log in first user
      if (cleanInput === 'admin' || cleanInput === 'taryadi' || cleanInput === 'user' || cleanInput === '') {
        const defaultUser = dummyPegawaiList[0];
        setUser(defaultUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
        return { success: true };
      }
      return { success: false, message: 'Username / NIP tidak ditemukan dalam database.' };
    }
  };

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
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
