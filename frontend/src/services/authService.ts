/* eslint-disable */
import api from './api';
import { User, Address, LoginResponse } from '../types';
import { TENANT_HEADER } from './productService';
import { cartService } from './cartService';
import { SafeAny } from "../types/safeAny";

/**
 * Ateliê Filhos de Aruanda - Auth & User Service
 * Autenticação e gestão de dados do usuário.
 */

export const authService = {
    register: async (userData: SafeAny): Promise<SafeAny> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    verify: async (email: string, code: string): Promise<SafeAny> => {
        const response = await api.post('/auth/verify', { email, code });
        return response.data;
    },

    login: async (email: string, password: string): Promise<User> => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data?.token) {
                authService.setSession(response.data);

                // Migrar carrinho de convidado para o usuário logado
                await cartService.migrate(response.data.id);

                window.dispatchEvent(new Event('auth-changed'));
                return response.data;
            }
            throw new Error("Resposta de login inválida");
        } catch (error) {
            console.error("[authService] Erro no login:", error);
            throw error;
        }
    },

    /**
     * Login com Google — usa access_token do @react-oauth/google.
     * O frontend já buscou o userInfo do Google e envia ao backend.
     */
    googleLoginWithUserInfo: async (userInfo: SafeAny, accessToken: string): Promise<User> => {
        try {
            const response = await api.post('/auth/google', {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                googleId: userInfo.sub,
                accessToken,
            });

            if (response.data.token) {
                authService.setSession(response.data);

                // Migrar carrinho
                await cartService.migrate(response.data.id);

                window.dispatchEvent(new Event('auth-changed'));
                return response.data;
            }
            throw new Error("Resposta de login Google inválida");
        } catch (error) {
            console.error('[authService] Erro no Google Login:', error);
            throw error;
        }
    },

    setSession: (data: LoginResponse): void => {
        localStorage.setItem('auth_token', data.token);
        const userObj: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            emailVerified: data.emailVerified,
            photoUrl: data.photoUrl,
            googleId: data.googleId,
            document: data.document
        };
        localStorage.setItem('user', JSON.stringify(userObj));
    },

    logout: (): void => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-changed'));
        window.location.href = '/';
    },

    requestPasswordReset: async (email: string): Promise<SafeAny> => {
        const response = await api.post('/auth/password-reset', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<SafeAny> => {
        const response = await api.post('/auth/password-reset/reset', { token, newPassword });
        return response.data;
    },

    getUser: (): User | null => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    },

    isAuthenticated: (): boolean => !!localStorage.getItem('auth_token'),

    // --- ENDEREÇOS ---
    address: {
        get: async (userId: string): Promise<Address[]> => {
            if (!userId) return [];
            try {
                const response = await api.get(`/addresses/user/${userId}`, {
                    headers: TENANT_HEADER
                });
                return response.data || [];
            } catch (e) {
                console.error("[authService] Erro ao buscar endereços", e);
                return [];
            }
        },
        create: async (userId: string, addressData: Address): Promise<Address> => {
            try {
                const response = await api.post(`/addresses/user/${userId}`, addressData, {
                    headers: TENANT_HEADER
                });
                return response.data;
            } catch (e) {
                console.error("[authService] Erro ao salvar endereço", e);
                throw e;
            }
        },
        delete: async (userId: string, addressId: string): Promise<void> => {
            try {
                await api.delete(`/addresses/${addressId}/user/${userId}`, {
                    headers: TENANT_HEADER
                });
            } catch (e) {
                console.error("[authService] Erro ao excluir endereço", e);
                throw e;
            }
        }
    },

    // --- CARTÕES ---
    cards: {
        get: async (): Promise<SafeAny[]> => {
            try {
                const response = await api.get('/customer/cards', {
                    headers: TENANT_HEADER
                });
                return Array.isArray(response.data) ? response.data : [];
            } catch (e) {
                console.error("[authService] Erro ao buscar cartões salvos", e);
                return [];
            }
        },
        delete: async (cardId: string): Promise<void> => {
            try {
                await api.delete(`/customer/cards/${cardId}`, {
                    headers: TENANT_HEADER
                });
            } catch (e) {
                console.error("[authService] Erro ao excluir cartão", e);
                throw e;
            }
        }
    },

    // --- FAVORITOS ---
    favorites: {
        get: async (userId: string): Promise<SafeAny[]> => {
            if (!userId) return [];
            try {
                const response = await api.get(`/favorites/user/${userId}`, {
                    headers: TENANT_HEADER
                });
                return (response.data || []).map((f: SafeAny) => f.product);
            } catch (e) {
                console.error("[authService] Erro ao buscar favoritos da API", e);
                return [];
            }
        },
        toggle: async (userId: string, productId: string): Promise<boolean> => {
            if (!userId || !productId) return false;
            try {
                const current = await authService.favorites.get(userId);
                const isFav = current.some(p => p.id === productId);

                if (isFav) {
                    await api.delete('/favorites', {
                        params: { userId, productId },
                        headers: TENANT_HEADER
                    });
                } else {
                    await api.post('/favorites', { userId, productId }, {
                        headers: TENANT_HEADER
                    });
                }
                return !isFav;
            } catch (e) {
                console.error("[authService] Erro ao alternar favorito na API", e);
                throw e;
            }
        }
    },

    updateProfile: async (userData: { name?: string; document?: string }): Promise<void> => {
        try {
            await api.patch('/users/profile', userData, {
                headers: TENANT_HEADER
            });

            // Atualizar localStorage
            const currentUser = authService.getUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...userData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('auth-changed'));
            }
        } catch (e) {
            console.error("[authService] Erro ao atualizar perfil", e);
            throw e;
        }
    }
};
