import { useState, useEffect } from 'react';
import type { AjuanSuratTugas } from '@/types';
import { dummyAjuanSuratTugas } from '@/data/dummyData';

const STORAGE_KEY = 'sim_tugas_data';

export const useSuratTugas = () => {
  const [tugasList, setTugasList] = useState<AjuanSuratTugas[]>([]);

  // Initialize data from local storage or fallback to dummy data
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setTugasList(JSON.parse(storedData));
      } catch (error) {
        console.error('Gagal parsing data dari local storage', error);
        setTugasList(dummyAjuanSuratTugas);
      }
    } else {
      setTugasList(dummyAjuanSuratTugas);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyAjuanSuratTugas));
    }
  }, []);

  const saveToStorage = (newData: AjuanSuratTugas[]) => {
    setTugasList(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const addTugas = (tugas: AjuanSuratTugas) => {
    const newData = [tugas, ...tugasList];
    saveToStorage(newData);
  };

  const updateTugas = (id: string, updatedTugas: Partial<AjuanSuratTugas>) => {
    const newData = tugasList.map((tugas) =>
      tugas.id === id ? { ...tugas, ...updatedTugas } : tugas
    );
    saveToStorage(newData);
  };

  const deleteTugas = (id: string) => {
    const newData = tugasList.filter((tugas) => tugas.id !== id);
    saveToStorage(newData);
  };

  const updateTugasStatus = (id: string, status: AjuanSuratTugas['status']) => {
    updateTugas(id, { status });
  };

  return {
    tugasList,
    addTugas,
    updateTugas,
    deleteTugas,
    updateTugasStatus,
    setTugasList: saveToStorage, // exposes raw setter that syncs to storage
  };
};
