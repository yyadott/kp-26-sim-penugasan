import { useState, useEffect } from 'react';

export type Pokja = {
  id: number;
  kode: string;
  nama: string;
};

const INITIAL_POKJAS: Pokja[] = [
  { id: 1, kode: 'UNIT-01', nama: 'Kepeg' },
  { id: 2, kode: 'UNIT-02', nama: 'Fastingkom' },
  { id: 3, kode: 'UNIT-03', nama: 'PM' },
];

export const usePokja = () => {
  const [pokjas, setPokjas] = useState<Pokja[]>(() => {
    const saved = localStorage.getItem('sim_penugasan_unit_kerja_v2');
    return saved ? JSON.parse(saved) : INITIAL_POKJAS;
  });

  useEffect(() => {
    localStorage.setItem('sim_penugasan_unit_kerja_v2', JSON.stringify(pokjas));
  }, [pokjas]);

  const addPokja = (kode: string, nama: string) => {
    setPokjas(items => [...items, { id: Date.now(), kode, nama }]);
  };

  const updatePokja = (id: number, kode: string, nama: string) => {
    setPokjas(items => items.map(p => p.id === id ? { ...p, kode, nama } : p));
  };

  const deletePokja = (id: number) => {
    setPokjas(items => items.filter(p => p.id !== id));
  };

  return {
    pokjas,
    addPokja,
    updatePokja,
    deletePokja
  };
};
