import axios from 'axios';
import { startLoading, stopLoading } from '../context/LoadingContext';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Escritas (POST, PUT, DELETE) mostram overlay global
    // Leituras (GET) mostram apenas barra de progresso
    const isWriteOperation = ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '');
    startLoading(isWriteOperation);

    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Padronização Multi-tenancy via Header conforme arquitetura Backend
    if (config.headers) {
      config.headers['X-Tenant-ID'] = '1';
    }

    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  (error) => {
    stopLoading();
    if (error.response?.status === 401) {
      console.warn('Sessão expirada ou não autorizada. Redirecionando para login.');
      localStorage.removeItem('auth_token');
      // Só redireciona se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

