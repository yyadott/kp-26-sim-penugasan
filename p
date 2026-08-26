# Rencana Implementasi: Sinkronisasi Data via Local Storage

## Deskripsi Tujuan
Saat ini, semua halaman mengambil data surat tugas langsung dari array statis `dummyAjuanSuratTugas`. Untuk membuat aplikasi ini interaktif layaknya aplikasi nyata (misal: Admin membuat tugas -> muncul di Approver -> disetujui -> muncul di Anggota), kita akan membuat mekanisme penyimpanan terpusat sementara menggunakan **Local Storage** browser.

## User Review Required
> [!IMPORTANT]
> Karena perubahan ini melibatkan banyak halaman (Halaman Dasbor, Admin, Approver, dan Anggota), mohon pastikan rencana di bawah ini sudah sesuai sebelum dieksekusi.

## Proposed Changes

### Komponen Pengelola Data (Custom Hook)
Kita akan membuat pengelola state global berbasis Local Storage. Jika storage kosong, data awal akan otomatis diisi oleh `dummyAjuanSuratTugas`.
#### [NEW] `src/hooks/useSuratTugas.ts`
Berisi fungsi-fungsi seperti:
- `getTugas()`: Mengambil semua data dari Local Storage.
- `addTugas(tugasBaru)`: Menambah tugas dari Admin ke storage.
- `updateTugasStatus(id, status)`: Untuk Approver menyetujui/menolak.

### Modifikasi Halaman Admin
Agar tugas yang baru dibuat oleh Admin langsung tersimpan ke sistem (bukan array statis) dan bisa dilihat oleh halaman lain.
#### [MODIFY] `src/pages/admin/BuatTugasPage.tsx`
Mengubah fungsi tombol simpan untuk memanggil `addTugas()`.
#### [MODIFY] `src/pages/admin/TugasPage.tsx`
Mengubah pengambilan data menggunakan `getTugas()`.

### Modifikasi Halaman Approver
Agar Approver membaca data asli yang (mungkin) sudah ditambah Admin, dan menyimpan status persetujuannya secara permanen.
#### [MODIFY] `src/pages/approval/ApprovalTugasPage.tsx`
Menggunakan fungsi `updateTugasStatus()` saat dokumen disetujui.

### Modifikasi Halaman Anggota / User
Agar pegawai biasa bisa melihat status penugasan mereka yang terbaru.
#### [MODIFY] `src/pages/user/TugasPage.tsx`
#### [MODIFY] `src/pages/user/DashboardPage.tsx`

## Verification Plan
### Manual Verification
1. Login sebagai **Admin Tugas**, lalu buat 1 surat tugas percobaan.
2. Login sebagai **Approver**, pastikan surat tersebut langsung muncul dan bisa disetujui.
3. Login sebagai **Anggota** (yang ditugaskan), pastikan tugas tersebut muncul di dasbornya dengan status *Disetujui*.
