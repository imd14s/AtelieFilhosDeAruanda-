import { api } from '../api/axios';
import { Category } from '../types/category';

export const CategoryService = {
    getAll: async (): Promise<Category[]> => {
        // Note: Adjust the endpoint if necessary. Backend might use /categories or /admin/categories
        // Based on SecurityConfig, GET /categories/** is public
        const { data } = await api.get<Category[]>('/products/categories');
        return data;
    },

    create: async (payload: { name: string; active: boolean }): Promise<Category> => {
        const { data } = await api.post<Category>('/categories', payload);
        return data;
    }
};
