import axios from 'axios';

// Base URL untuk API Backend
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Disesuaikan dengan port backend NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor opsional untuk menambahkan token auth jika diperlukan nantinya
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
