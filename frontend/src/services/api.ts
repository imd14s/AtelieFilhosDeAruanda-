import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adiciona o Token JWT automaticamente se ele existir
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Trata erros de resposta globalmente
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        // Se o erro for 401 (Unauthorized) e não for uma tentativa de login
        if (error.response?.status === 401 && error.config?.url && !error.config.url.includes('/auth/login')) {
            console.warn("[API] Sessão expirada ou inválida. Limpando dados locais...");
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-changed'));
        }
        return Promise.reject(error);
    }
);

export default api;
