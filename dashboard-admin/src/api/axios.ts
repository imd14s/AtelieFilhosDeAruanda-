import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Aponta para o Backend Java
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Adiciona o Token JWT em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Se der 401 (Unauthorized), desloga o usuário
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
