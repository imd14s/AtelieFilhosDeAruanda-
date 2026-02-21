import api from './api';
import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

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

    googleLogin: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Enviar o token para o backend persistir ou validar
            const response = await api.post('/auth/google', { idToken });

            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                // Salvar dados do usuário do Firebase ou do Backend
                localStorage.setItem('user', JSON.stringify({
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL
                }));
            }
            return response.data;
        } catch (error) {
            console.error("[authService] Erro no Google Login:", error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
    }
};
