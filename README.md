# KP 26 SIM Penugasan

Proyek ini berisi aplikasi `frontend` React/Vite dan `backend` NestJS untuk simulasi penugasan.

## Struktur proyek

- `backend/` - NestJS backend API
- `frontend/` - React + Vite frontend

## Persyaratan

- Node.js 18+ (direkomendasikan)
- npm

## Setup

Instal dependensi untuk kedua paket:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Menjalankan aplikasi

### Backend

```bash
cd backend
npm run start:dev
```

Backend mencoba `PORT=3000` secara default. Jika port sudah terpakai, aplikasi akan otomatis mencari port berikutnya.

### Frontend

```bash
cd frontend
npm run dev
```

Frontend dijalankan di `http://localhost:5173/kp-26-sim-penugasan/`.

## Konfigurasi integrasi

Frontend menggunakan file `frontend/src/api/axiosInstance.ts` untuk memanggil backend.
Secara default, base URL backend adalah:

```ts
http://localhost:3000/api
```

Jika backend berjalan di port yang berbeda, buat file `.env` di folder `frontend` dan tambahkan:

```env
VITE_API_URL=http://localhost:3002/api
```

Lalu restart server frontend.

## Lint dan build

### Backend

```bash
cd backend
npm run lint
```

### Frontend

```bash
cd frontend
npm run build
```

## Catatan

- `frontend/README.md` dan `backend/README.md` berisi dokumentasi masing-masing starter template.
- Gunakan README root ini sebagai petunjuk utama untuk menjalankan aplikasi secara keseluruhan.
