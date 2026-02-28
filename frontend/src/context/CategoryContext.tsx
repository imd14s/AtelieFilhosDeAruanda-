import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '../types';
import { productService } from '../services/productService';

interface CategoryContextType {
    categories: Category[];
    loading: boolean;
    error: string | null;
    refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getCategories();
            // Filtra apenas ativas e ordena alfabeticamente
            const activeCategories = data
                .filter(c => c.active !== false)
                .sort((a, b) => a.name.localeCompare(b.name));
            setCategories(activeCategories);
        } catch (err) {
            console.error('[CategoryContext] Erro ao carregar categorias:', err);
            setError('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryContext.Provider value={{
            categories,
            loading,
            error,
            refreshCategories: fetchCategories
        }}>
            {children}
        </CategoryContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories deve ser usado dentro de um CategoryProvider');
    }
    return context;
};
