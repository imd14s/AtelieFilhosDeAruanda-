import { api } from '../api/axios';
import type { Category } from '../types/category';

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        // Correct endpoint based on CategoryController mapping
        const { data } = await api.get<Category[]>('/categories');
        return data;
    },

    create: async (payload: { name: string; active: boolean }): Promise<Category> => {
        const { data } = await api.post<Category>('/categories', payload);
        return data;
    }
};
