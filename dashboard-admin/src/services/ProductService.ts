import { api } from '../api/axios';
import type { Product } from '../types/dashboard';

export type CreateProductDTO = Omit<Product, 'id' | 'active'>;

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (product: CreateProductDTO) => {
    return api.post('/products', product);
  },

  update: async (id: string, product: Partial<CreateProductDTO>) => {
    return api.put(`/products/${id}`, product);
  },

  toggleActive: async (id: string) => {
    return api.patch(`/products/${id}/toggle`);
  },

  delete: async (id: string) => {
    return api.delete(`/products/${id}`);
  },

  toggleAlert: async (id: string) => {
    return api.put(`/dashboard/products/${id}/toggle-alert`);
  }
};
