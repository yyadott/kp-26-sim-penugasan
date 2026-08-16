import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/pages/super-admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AbsensiPage = lazy(() => import('@/pages/super-admin/AbsensiPage').then(m => ({ default: m.AbsensiPage })));
const TugasPage = lazy(() => import('@/pages/super-admin/TugasPage').then(m => ({ default: m.TugasPage })));
const PemetaanPage = lazy(() => import('@/pages/super-admin/PemetaanPage').then(m => ({ default: m.PemetaanPage })));
const ProfilePage = lazy(() => import('@/pages/super-admin/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotifikasiPage = lazy(() => import('@/pages/super-admin/NotifikasiPage').then(m => ({ default: m.NotifikasiPage })));

// Superadmin management pages
const AkunPage = lazy(() => import('@/pages/super-admin/AkunPage').then(m => ({ default: m.AkunPage })));
const PokjaPage = lazy(() => import('@/pages/super-admin/PokjaPage').then(m => ({ default: m.PokjaPage })));

// Administrator pages
const AjuanPegawaiPage = lazy(() => import('@/pages/super-admin/AjuanPegawaiPage').then(m => ({ default: m.AjuanPegawaiPage })));
const RekapPenugasanPage = lazy(() => import('@/pages/super-admin/RekapPenugasanPage').then(m => ({ default: m.RekapPenugasanPage })));

// Anggota management sub-pages
const AnggotaPage = lazy(() => import('@/pages/super-admin/AnggotaPage').then(m => ({ default: m.AnggotaPage })));
const TambahAnggotaPage = lazy(() => import('@/pages/super-admin/TambahAnggotaPage').then(m => ({ default: m.TambahAnggotaPage })));
const EditAnggotaPage = lazy(() => import('@/pages/super-admin/EditAnggotaPage').then(m => ({ default: m.EditAnggotaPage })));
const HapusAnggotaPage = lazy(() => import('@/pages/super-admin/HapusAnggotaPage').then(m => ({ default: m.HapusAnggotaPage })));

// Absensi sub-pages
const LihatAbsensiPage = lazy(() => import('@/pages/super-admin/LihatAbsensiPage').then(m => ({ default: m.LihatAbsensiPage })));
const VerifikasiAbsensiPage = lazy(() => import('@/pages/super-admin/VerifikasiAbsensiPage').then(m => ({ default: m.VerifikasiAbsensiPage })));
const RekapAbsensiPage = lazy(() => import('@/pages/super-admin/RekapAbsensiPage').then(m => ({ default: m.RekapAbsensiPage })));

// Tugas sub-pages
const BuatTugasPage = lazy(() => import('@/pages/super-admin/BuatTugasPage').then(m => ({ default: m.BuatTugasPage })));
const EditTugasPage = lazy(() => import('@/pages/super-admin/EditTugasPage').then(m => ({ default: m.EditTugasPage })));
const UploadSuratPage = lazy(() => import('@/pages/super-admin/UploadSuratPage').then(m => ({ default: m.UploadSuratPage })));
const MonitoringTugasPage = lazy(() => import('@/pages/super-admin/MonitoringTugasPage').then(m => ({ default: m.MonitoringTugasPage })));

// Other pages
const LaporanPage = lazy(() => import('@/pages/super-admin/LaporanPage').then(m => ({ default: m.LaporanPage })));
const SimpananPage = lazy(() => import('@/pages/super-admin/SimpananPage').then(m => ({ default: m.SimpananPage })));

// Pages retained from previous routes
const AdminPage = lazy(() => import('@/pages/super-admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ApprovalPage = lazy(() => import('@/pages/super-admin/ApprovalPage').then(m => ({ default: m.ApprovalPage })));
const UserPage = lazy(() => import('@/pages/super-admin/UserPage').then(m => ({ default: m.UserPage })));
const BidangPage = lazy(() => import('@/pages/super-admin/BidangPage').then(m => ({ default: m.BidangPage })));

const PageLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);

export const SuperAdminRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Anggota Management */}
        <Route path="anggota" element={<AnggotaPage />} />
        <Route path="anggota/tambah" element={<TambahAnggotaPage />} />
        <Route path="anggota/edit" element={<EditAnggotaPage />} />
        <Route path="anggota/hapus" element={<HapusAnggotaPage />} />

        {/* Absensi */}
        <Route path="absensi" element={<AbsensiPage />} />
        <Route path="absensi/lihat" element={<LihatAbsensiPage />} />
        <Route path="absensi/verifikasi" element={<VerifikasiAbsensiPage />} />
        <Route path="absensi/rekap" element={<RekapAbsensiPage />} />

        {/* Tugas / Penugasan */}
        <Route path="tugas" element={<TugasPage />} />
        <Route path="tugas/buat" element={<BuatTugasPage />} />
        <Route path="tugas/edit" element={<EditTugasPage />} />
        <Route path="tugas/upload-surat" element={<UploadSuratPage />} />
        <Route path="tugas/monitoring" element={<MonitoringTugasPage />} />

        {/* Pemetaan */}
        <Route path="pemetaan" element={<PemetaanPage />} />

        {/* Superadmin Management */}
        <Route path="akun" element={<AkunPage />} />
        <Route path="pokja" element={<PokjaPage />} />

        {/* Administrator */}
        <Route path="ajuan-pegawai" element={<AjuanPegawaiPage />} />
        <Route path="rekap-penugasan" element={<RekapPenugasanPage />} />

        {/* Other */}
        <Route path="simpanan" element={<SimpananPage />} />
        <Route path="notifikasi" element={<NotifikasiPage />} />
        <Route path="laporan" element={<LaporanPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Retained from previous routes */}
        <Route path="admin" element={<AdminPage />} />
        <Route path="approval" element={<ApprovalPage />} />
        <Route path="user" element={<UserPage />} />
        <Route path="bidang" element={<BidangPage />} />

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
