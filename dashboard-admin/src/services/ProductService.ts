import { api } from '../api/axios';
import type { Product, CreateProductDTO } from '../types/product';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<any>('/products');
    // Se vier paginado (Spring Page), retorna o content. Se vier array direto, retorna data.
    const content = Array.isArray(data) ? data : (data.content || []);

    // Map backend 'name' to frontend 'title' to ensure list displays correctly
    return content.map((p: any) => ({
      ...p,
      title: p.name || p.title || 'Sem Título',
      stock: p.stockQuantity !== undefined ? p.stockQuantity : p.stock
    }));
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

  toggleAlert: async (id: string): Promise<void> => {
    await api.put(`/products/${id}/toggle-alert`);
  },

  generateDescription: async (title: string): Promise<string> => {
    const { data } = await api.post<{ description: string }>('/products/generate-description', { title });
    return data.description;
  }
};
