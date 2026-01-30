import { api } from '../api/axios';
import type { Product } from '../types/dashboard';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    // Busca todos os produtos (Backend deve suportar GET /products)
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

  toggleActive: async (id: string) => {
    return api.patch(`/products/${id}/toggle`);
  },

  delete: async (id: string) => {
    return api.delete(`/products/${id}`);
  }
};
