import api from './api';

export const authService = {
    register: async (userData) => {
        // userData: { name, email, password }
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    verify: async (email, code) => {
        const response = await api.post('/auth/verify', { email, code });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    googleLogin: async (idToken) => {
        const response = await api.post('/auth/google', { idToken });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('auth_token');
    }
};
