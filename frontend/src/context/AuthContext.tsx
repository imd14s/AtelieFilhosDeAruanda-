/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => authService.getUser());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const checkAuth = useCallback(() => {
        const currentUser = authService.getUser();
        setUser(currentUser);
        setIsAuthenticated(authService.isAuthenticated());
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Escuta mudanças externas de autenticação (localStorage/eventos)
        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('auth-changed', handleAuthChange);
        return () => window.removeEventListener('auth-changed', handleAuthChange);
    }, [checkAuth]);

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        return await authService.login(email, password);
    }, []);

    const logout = useCallback(() => {
        authService.logout();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, checkAuth }}>
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
