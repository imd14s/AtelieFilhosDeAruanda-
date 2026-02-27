/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Configuração do NProgress
nprogress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.1
});

interface LoadingContextType {
    isGlobalLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Listeners externos para o Axios
let updateIsGlobalLoading: (val: boolean) => void = () => { };

export const startLoading = (isGlobal = false) => {
    nprogress.start();
    if (isGlobal) {
        updateIsGlobalLoading(true);
    }
};

export const stopLoading = () => {
    nprogress.done();
    updateIsGlobalLoading(false);
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);

    useEffect(() => {
        updateIsGlobalLoading = setIsGlobalLoading;
    }, []);

    return (
        <LoadingContext.Provider value={{ isGlobalLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
