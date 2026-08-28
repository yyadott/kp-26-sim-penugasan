import { useState, useEffect } from 'react';

export type Pokja = {
  id: number;
  kode: string;
  nama: string;
};

const INITIAL_POKJAS: Pokja[] = [
  { id: 1, kode: 'POKJA-01', nama: 'Departemen IT & Infrastruktur' },
  { id: 2, kode: 'POKJA-02', nama: 'Departemen SDM & Keuangan' },
  { id: 3, kode: 'POKJA-03', nama: 'Tim Riset & Pengembangan' },
];

export const usePokja = () => {
  const [pokjas, setPokjas] = useState<Pokja[]>(() => {
    const saved = localStorage.getItem('sim_penugasan_pokja');
    return saved ? JSON.parse(saved) : INITIAL_POKJAS;
  });

  useEffect(() => {
    localStorage.setItem('sim_penugasan_pokja', JSON.stringify(pokjas));
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
