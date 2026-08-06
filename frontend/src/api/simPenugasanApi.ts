import { axiosInstance } from './axiosInstance';
import type { AjuanSuratTugas, Pegawai, PresensiItem, RekapPresensiPribadi } from '@/types';

export interface LoginResponse {
  token: string;
  user: Pegawai;
}

export const simPenugasanApi = {
  login: async (username: string, password: string) =>
    (await axiosInstance.post<LoginResponse>('/auth/login', { username, password })).data,
  getDashboard: async () => (await axiosInstance.get('/dashboard')).data,
  getTugas: async () => (await axiosInstance.get<AjuanSuratTugas[]>('/tugas')).data,
  createTugas: async (data: Partial<AjuanSuratTugas>) =>
    (await axiosInstance.post<AjuanSuratTugas>('/tugas', data)).data,
  getAbsensi: async () =>
    (await axiosInstance.get<{ pribadi: RekapPresensiPribadi; riwayat: PresensiItem[]; pegawaiLain: PresensiItem[] }>('/absensi')).data,
};
