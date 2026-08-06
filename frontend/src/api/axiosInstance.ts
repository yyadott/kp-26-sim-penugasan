import axios from 'axios';

export const axiosInstance = axios.create({
  // NestJS uses port 3000 by default (see backend/src/main.ts).
  // VITE_API_URL can be set for staging/production deployments.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Opsional: Interceptor untuk mengirimkan token JWT jika nanti menggunakan Auth
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
