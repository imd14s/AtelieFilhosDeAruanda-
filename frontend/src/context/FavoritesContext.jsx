import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storeService } from '../services/storeService';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]); // IDs dos produtos favoritos
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Busca favoritos do backend
    const refreshFavorites = useCallback(async () => {
        const user = storeService.auth.getUser();
        const userId = user?.id || user?.googleId;

        if (!userId) {
            setFavorites([]);
            setInitialized(true);
            return;
        }

        try {
            const data = await storeService.favorites.get(userId);
            // Armazenamos apenas os IDs para checagem rápida nos cards
            setFavorites(data.map(p => p.id));
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

    const isFavorite = useCallback((productId) => {
        return favorites.includes(productId);
    }, [favorites]);

    const toggleFavorite = async (product) => {
        const user = storeService.auth.getUser();
        const token = localStorage.getItem('auth_token');
        const userId = user?.id || user?.googleId;

        if (!userId || !token) {
            window.dispatchEvent(new CustomEvent('show-alert', { detail: "Sua sessão expirou ou você não está logado. Faça login para favoritar." }));
            // Limpa dados residuais se o token sumiu mas o user ainda estava no estado
            if (!token && userId) {
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth-changed'));
            }
            window.dispatchEvent(new CustomEvent('show-alert', { detail: "Faça login para favoritar produtos." }));
            window.dispatchEvent(new Event('open-auth-modal'));
            return false;
        }

        setLoading(true);
        try {
            const isAdding = !isFavorite(product.id);
            await storeService.favorites.toggle(userId, product.id);

            // Atualização otimista do estado local
            if (isAdding) {
                setFavorites(prev => [...prev, product.id]);
            } else {
                setFavorites(prev => prev.filter(id => id !== product.id));
            }

            // Notifica outros componentes (como a FavoritesPage se ela não usar o contexto)
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

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
    }
    return context;
};
