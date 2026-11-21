import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PegawaiPage = lazy(() => import('@/pages/admin/PegawaiPage').then(m => ({ default: m.PegawaiPage })));
const AbsensiPage = lazy(() => import('@/pages/admin/AbsensiPage').then(m => ({ default: m.AbsensiPage })));
const TugasPage = lazy(() => import('@/pages/admin/TugasPage').then(m => ({ default: m.TugasPage })));
const PemetaanPage = lazy(() => import('@/pages/admin/PemetaanPage').then(m => ({ default: m.PemetaanPage })));
const NotifikasiPage = lazy(() => import('@/pages/admin/NotifikasiPage').then(m => ({ default: m.NotifikasiPage })));
const ProfilePage = lazy(() => import('@/pages/admin/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AjuanPegawaiPage = lazy(() => import('@/pages/admin/AjuanPegawaiPage').then(m => ({ default: m.AjuanPegawaiPage })));
const RekapPenugasanPage = lazy(() => import('@/pages/admin/RekapPenugasanPage').then(m => ({ default: m.RekapPenugasanPage })));

// New pages from backup
const DetailPegawaiPage = lazy(() => import('@/pages/admin/DetailPegawaiPage').then(m => ({ default: m.DetailPegawaiPage })));
const BuatTugasPage = lazy(() => import('@/pages/admin/BuatTugasPage').then(m => ({ default: m.BuatTugasPage })));
const EditTugasPage = lazy(() => import('@/pages/admin/EditTugasPage').then(m => ({ default: m.EditTugasPage })));
const MonitoringTugasPage = lazy(() => import('@/pages/admin/MonitoringTugasPage').then(m => ({ default: m.MonitoringTugasPage })));
const UploadSuratPage = lazy(() => import('@/pages/admin/UploadSuratPage').then(m => ({ default: m.UploadSuratPage })));

const PageLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);

export const AdminRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="pegawai" element={<PegawaiPage />} />
        
        {/* Pegawai / Ajuan */}
        <Route path="pegawai/detail/:id" element={<DetailPegawaiPage />} />
        <Route path="ajuan-pegawai" element={<AjuanPegawaiPage />} />
        <Route path="rekap-penugasan" element={<RekapPenugasanPage />} />
        
        {/* Absensi */}
        <Route path="absensi" element={<AbsensiPage />} />
        
        {/* Tugas / Penugasan */}
        <Route path="tugas" element={<TugasPage />} />
        <Route path="tugas/buat" element={<BuatTugasPage />} />
        <Route path="tugas/edit" element={<EditTugasPage />} />
        <Route path="tugas/monitoring" element={<MonitoringTugasPage />} />
        <Route path="tugas/upload-surat" element={<UploadSuratPage />} />

        {/* Other Pages */}
        <Route path="pemetaan" element={<PemetaanPage />} />
        <Route path="notifikasi" element={<NotifikasiPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
