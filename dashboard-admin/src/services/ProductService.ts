import { api } from '../api/axios';
import type { Product, CreateProductDTO } from '../types/product';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<any>('/products');
    const content = Array.isArray(data) ? data : (data.content || []);

    return content.map((p: any) => ({
      ...p,
      title: p.name || p.title || 'Sem Título',
      stock: p.stockQuantity !== undefined ? p.stockQuantity : (p.stock || 0),
      media: (p.images || []).map((url: string, index: number) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
        return {
          id: `temp-${index}-${p.id}`,
          url: url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          isMain: index === 0
        };
      })
    }));
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<any>(`/products/${id}`);

    // Adapter: Transform Backend Entity to Frontend Interface
    const product: Product = {
      ...data,
      // Map 'stockQuantity' (backend) to 'stock' (frontend)
      stock: data.stockQuantity !== undefined ? data.stockQuantity : data.stock,

      // Parse attributesJson string to attributes object
      variants: (data.variants || []).map((v: any) => ({
        ...v,
        stock: v.stockQuantity, // Map variant stock
        attributes: v.attributesJson ? JSON.parse(v.attributesJson) : (v.attributes || {}),
        media: [] // Backend variants don't have media yet
      })),

      // Map simple string[] images to full ProductMedia[]
      media: (data.images || []).map((url: string, index: number) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
        return {
          id: crypto.randomUUID(), // Generate temp ID for frontend key
          url: url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          isMain: index === 0 && !isVideo
        };
      })
    };

    return product;
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
