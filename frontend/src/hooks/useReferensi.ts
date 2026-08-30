import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

export type RoleItem = {
  id: number;
  name: string;
};

export type UnitKerjaItem = {
  id: number;
  name: string;
};

export const useReferensi = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [unitKerja, setUnitKerja] = useState<UnitKerjaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferensi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resRoles, resUnit] = await Promise.all([
        fetch(`${API_BASE}/roles`),
        fetch(`${API_BASE}/unit-kerja`),
      ]);

      if (!resRoles.ok || !resUnit.ok) {
        throw new Error('Gagal mengambil data referensi');
      }

      const dataRoles = await resRoles.json();
      const dataUnit = await resUnit.json();

      setRoles(dataRoles);
      setUnitKerja(dataUnit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching referensi:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferensi();
  }, [fetchReferensi]);

  return {
    roles,
    unitKerja,
    isLoading,
    error,
    fetchReferensi,
  };
};
