import api from './api';
import { User, Address } from '../types';
import { TENANT_HEADER } from './productService';
import { cartService } from './cartService';

/**
 * Ateliê Filhos de Aruanda - Auth & User Service
 * Autenticação e gestão de dados do usuário.
 */

export const authService = {
    login: async (email: string, password: string): Promise<User> => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data?.token) {
                localStorage.setItem('auth_token', response.data.token);
                const userObj: User = {
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                    emailVerified: response.data.emailVerified,
                    photoUrl: response.data.photoUrl,
                    googleId: response.data.googleId
                };
                localStorage.setItem('user', JSON.stringify(userObj));

                // Migrar carrinho de convidado para o usuário logado
                await cartService.migrate(userObj.id);

                window.dispatchEvent(new Event('auth-changed'));
                return userObj;
            }
            throw new Error("Resposta de login inválida");
        } catch (error) {
            console.error("[authService] Erro no login:", error);
            throw error;
        }
    },

    logout: (): void => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-changed'));
        window.location.href = '/';
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
        get: async (): Promise<any[]> => {
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
        get: async (userId: string): Promise<any[]> => {
            if (!userId) return [];
            try {
                const response = await api.get(`/favorites/user/${userId}`, {
                    headers: TENANT_HEADER
                });
                return (response.data || []).map((f: any) => f.product);
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
    }
};
