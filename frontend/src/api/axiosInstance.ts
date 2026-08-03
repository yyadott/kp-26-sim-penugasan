import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Server NestJS
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