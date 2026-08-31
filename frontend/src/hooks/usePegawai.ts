import { useState, useEffect, useCallback } from 'react';
import type { Pegawai } from '@/types';

const API_BASE = 'http://localhost:3001/api';

export const usePegawai = () => {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPegawai = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) throw new Error('Failed to fetch pegawai');
      const data = await response.json();
      setPegawaiList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching pegawai:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPegawaiById = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch pegawai');
      return await response.json();
    } catch (err) {
      console.error('Error fetching pegawai by id:', err);
      return null;
    }
  };

  const createPegawai = async (data: {
    nama: string;
    nip?: string;
    jabatan?: string;
    golongan?: string;
    pangkat?: string;
    email: string;
    password: string;
    unit_kerja_id: number;
    role_id: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create pegawai');
      const result = await response.json();
      await fetchPegawai(); // Refresh list
      return result;
    } catch (err) {
      console.error('Error creating pegawai:', err);
      throw err;
    }
  };

  const updatePegawai = async (id: string, data: {
    nama?: string;
    nip?: string;
    jabatan?: string;
    golongan?: string;
    pangkat?: string;
    email?: string;
    unit_kerja_id?: number;
    role_id?: number;
    password?: string;
    is_active?: boolean;
  }) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update pegawai');
      const result = await response.json();
      await fetchPegawai(); // Refresh list
      return result;
    } catch (err) {
      console.error('Error updating pegawai:', err);
      throw err;
    }
  };

  const deletePegawai = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete pegawai');
      await fetchPegawai(); // Refresh list
    } catch (err) {
      console.error('Error deleting pegawai:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  return {
    pegawaiList,
    isLoading,
    error,
    fetchPegawai,
    fetchPegawaiById,
    createPegawai,
    updatePegawai,
    deletePegawai,
  };
};
