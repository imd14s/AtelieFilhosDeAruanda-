import { api } from '../api/axios';
import type { Product, CreateProductDTO } from '../types/product';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<any>('/products');
    // Se vier paginado (Spring Page), retorna o content. Se vier array direto, retorna data.
    return Array.isArray(data) ? data : (data.content || []);
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
