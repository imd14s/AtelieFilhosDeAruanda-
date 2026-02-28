/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Address, Card } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    checkAuth: () => void;
    addresses: Address[];
    cards: Card[];
    refreshAddresses: () => Promise<void>;
    refreshCards: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => authService.getUser());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [cards, setCards] = useState<Card[]>([]);

    const refreshAddresses = useCallback(async () => {
        if (user?.id) {
            try {
                const data = await authService.address.get(user.id);
                setAddresses(data);
            } catch (err) {
                console.error('Error refreshing addresses:', err);
            }
        }
    }, [user?.id]);

    const refreshCards = useCallback(async () => {
        if (isAuthenticated) {
            try {
                const data = await authService.cards.get();
                setCards(data);
            } catch (err) {
                console.error('Error refreshing cards:', err);
            }
        }
    }, [isAuthenticated]);

    const checkAuth = useCallback(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
        setIsAuthenticated(authService.isAuthenticated());
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            refreshAddresses();
            refreshCards();
        }
    }, [isAuthenticated, user?.id, refreshAddresses, refreshCards]);

    useEffect(() => {
        // Escuta mudanças externas de autenticação (localStorage/eventos)
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('auth-changed', handleAuthChange);
        return () => window.removeEventListener('auth-changed', handleAuthChange);
    }, [checkAuth]);

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        const loggedUser = await authService.login(email, password);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return loggedUser;
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setAddresses([]);
        setCards([]);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
            checkAuth,
            addresses,
            cards,
            refreshAddresses,
            refreshCards
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
