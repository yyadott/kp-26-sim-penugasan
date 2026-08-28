import { useState, useEffect } from 'react';
import type { AjuanSuratTugas } from '@/types';
import apiClient from '@/api/client';
import { dummyAjuanSuratTugas } from '@/data/dummyData';
import { useAuth } from '@/hooks/useAuth';

export const useSuratTugas = () => {
  const { user } = useAuth();
  const [tugasList, setTugasList] = useState<AjuanSuratTugas[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTugas = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/tugas');
      let data = res.data && res.data.length > 0 ? res.data : dummyAjuanSuratTugas;
      
      // Filter data jika user adalah PEGAWAI
      if (user?.role === 'PEGAWAI') {
        data = data.filter((item: AjuanSuratTugas) => 
          item.pengaju?.id === user.id || 
          item.pegawaiDitugaskan.some(p => p.id === user.id)
        );
      }
      
      setTugasList(data);
    } catch (error) {
      console.error('Gagal mengambil data tugas dari server', error);
      
      // Fallback dummy data juga harus difilter
      let fallbackData = dummyAjuanSuratTugas;
      if (user?.role === 'PEGAWAI') {
        fallbackData = fallbackData.filter((item: AjuanSuratTugas) => 
          item.pengaju?.id === user.id || 
          item.pegawaiDitugaskan.some(p => p.id === user.id)
        );
      }
      setTugasList(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTugas();
  }, []);

  const addTugas = async (tugas: any) => {
    try {
      const res = await apiClient.post('/tugas', tugas);
      setTugasList((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error('Gagal menambah tugas', error);
      throw error;
    }
  };

  const updateTugasStatus = async (id: string, status: AjuanSuratTugas['status']) => {
    try {
      await apiClient.patch(`/tugas/${id}/status`, { status });
      setTugasList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    } catch (error) {
      console.error('Gagal update status tugas', error);
      throw error;
    }
  };

  const deleteTugas = async (_id: string) => {
    // try {
    //   await apiClient.delete(`/tugas/${id}`);
    //   setTugasList(prev => prev.filter(t => t.id !== id));
    // } catch(error) { ... }
  };

  return {
    tugasList,
    isLoading,
    addTugas,
    updateTugasStatus,
    deleteTugas,
    refreshTugas: fetchTugas
  };
};
