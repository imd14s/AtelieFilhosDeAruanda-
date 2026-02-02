import axios from 'axios';

// REGRA ZERO HARDCODE: Falhar se a variável não estiver definida.
// Jamais assumir localhost em código produtivo.
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('[Config] CRITICAL: VITE_API_URL is missing under import.meta.env');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token (mantendo lógica original segura)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
