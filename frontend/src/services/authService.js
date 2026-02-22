import api from './api';

console.log("[DEBUG - authService.js] Avaliando arquivo e objeto authService");

export const authService = {
    register: async (userData) => {
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
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                emailVerified: response.data.emailVerified
            }));
        }
        return response.data;
    },

    /**
     * Login com Google — usa access_token do @react-oauth/google.
     * O frontend já buscou o userInfo do Google e envia ao backend.
     * O backend valida via Google's tokeninfo endpoint e cria/autentica o usuário.
     */
    googleLoginWithUserInfo: async (userInfo, accessToken) => {
        try {
            const response = await api.post('/auth/google', {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                googleId: userInfo.sub,
                accessToken, // backend valida com https://oauth2.googleapis.com/tokeninfo
            });

            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                    emailVerified: response.data.emailVerified,
                    photoURL: userInfo.picture || null,
                }));
            }
            return response.data;
        } catch (error) {
            console.error('[authService] Erro no Google Login:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    getUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    isAuthenticated: () => !!localStorage.getItem('auth_token'),
};
