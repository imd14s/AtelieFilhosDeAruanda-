/* eslint-disable */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';
import { Product } from '../types';
import { SafeAny } from "../types/safeAny";

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (product: Product) => Promise<boolean>;
    refreshFavorites: () => Promise<void>;
    loading: boolean;
    initialized: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]); // IDs dos produtos favoritos
    const [loading, setLoading] = useState<boolean>(false);
    const [initialized, setInitialized] = useState<boolean>(false);

    // Busca favoritos do backend
    const refreshFavorites = useCallback(async () => {
        const user = authService.getUser();
        const userId = user?.id;

        if (!userId) {
            setFavorites([]);
            setInitialized(true);
            return;
        }

        try {
            const data = await authService.favorites.get(userId);
            // Armazenamos apenas os IDs para checagem rápida nos cards
            setFavorites(data.map((p: SafeAny) => p.id));
        } catch (error) {
            console.error("[FavoritesContext] Erro ao carregar favoritos:", error);
        } finally {
            setInitialized(true);
        }
    }, []);

    // Carrega inicialmente
    useEffect(() => {
        refreshFavorites();

        // Escuta login/logout para atualizar
        const handleAuthChange = () => refreshFavorites();
        window.addEventListener('auth-changed', handleAuthChange);
        return () => window.removeEventListener('auth-changed', handleAuthChange);
    }, [refreshFavorites]);

    const isFavorite = useCallback((productId: string) => {
        return favorites.includes(productId);
    }, [favorites]);

    const toggleFavorite = async (product: Product): Promise<boolean> => {
        const user = authService.getUser();
        const token = localStorage.getItem('auth_token');
        const userId = user?.id;

        if (!userId || !token) {
            // Notifica via evento global (alertas legados ou futuros)
            window.dispatchEvent(new CustomEvent('show-alert', { detail: "Sua sessão expirou ou você não está logado. Faça login para favoritar." }));

            if (!token && userId) {
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth-changed'));
            }
            window.dispatchEvent(new Event('open-auth-modal'));
            return false;
        }

        setLoading(true);
        try {
            const isAdding = !isFavorite(product.id);
            await authService.favorites.toggle(userId, product.id);

            // Atualização otimista do estado local
            if (isAdding) {
                setFavorites(prev => [...prev, product.id]);
            } else {
                setFavorites(prev => prev.filter(id => id !== product.id));
            }

            // Notifica outros componentes
            window.dispatchEvent(new CustomEvent('favorites-updated', {
                detail: { productId: product.id, isFavorite: isAdding }
            }));

            return true;
        } catch (error) {
            window.dispatchEvent(new CustomEvent('show-alert', {
                detail: "Erro ao atualizar favoritos. Tente novamente."
            }));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            isFavorite,
            toggleFavorite,
            refreshFavorites,
            loading,
            initialized
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
    }
    return context;
};
