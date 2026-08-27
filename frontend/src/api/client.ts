import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Disesuaikan dengan port backend NestJS
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sim_penugasan_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
