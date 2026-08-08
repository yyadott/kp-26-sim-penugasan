import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { AbsensiPage } from '@/pages/AbsensiPage';
import { TugasPage } from '@/pages/TugasPage';
import { PemetaanPage } from '@/pages/PemetaanPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilPage } from '@/pages/ProfilPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Route Halaman Utama */}
      <Route path="/" element={<DashboardPage />} />
      <Route path="/tugas" element={<TugasPage />} />
      <Route path="/absensi" element={<AbsensiPage />} />
      <Route path="/pemetaan" element={<PemetaanPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profil" element={<ProfilPage />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
