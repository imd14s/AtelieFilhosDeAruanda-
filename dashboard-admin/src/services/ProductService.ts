import { api } from '../api/axios';
import type { Product, CreateProductDTO } from '../types/product';

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Record<string, unknown>>('/products');
    const content = Array.isArray(data) ? data : (data.content || []);

    return (content as Record<string, unknown>[]).map((p: Record<string, unknown>) => ({
      ...p,
      title: p.name || p.title || 'Sem Título',
      stock: p.stockQuantity !== undefined ? p.stockQuantity : (p.stock || 0),
      media: Array.isArray(p.images) ? p.images.map((url: string, index: number) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
        return {
          id: `temp-${index}-${p.id}`,
          url: url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          isMain: index === 0
        };
      }) : []
    } as unknown as Product));
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Record<string, unknown>>(`/products/${id}`);

    // Adapter: Transform Backend Entity to Frontend Interface
    const product = {
      ...data,
      // Map 'stockQuantity' (backend) to 'stock' (frontend)
      stock: (data.stockQuantity !== undefined ? data.stockQuantity : data.stock) as number,


      // Parse attributesJson string to attributes object for variants
      variants: ((Array.isArray(data.variants) ? data.variants : []) as Record<string, unknown>[]).map((v: Record<string, unknown>) => ({
        ...v,
        stock: v.stockQuantity as number, // Map variant stock
        attributes: typeof v.attributesJson === 'string' ? JSON.parse(v.attributesJson as string) : (v.attributes || {}),
        media: ((v.images as string[]) || []).map((url: string, index: number) => {
          const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
          return {
            id: crypto.randomUUID(), // Generate temp ID for frontend key
            url: url,
            type: isVideo ? 'VIDEO' : 'IMAGE',
            isMain: index === 0 && !isVideo
          };
        })
      } as unknown as Record<string, unknown>)),

      // Map simple string[] images to full ProductMedia[]
      media: ((data.images as string[]) || []).map((url: string, index: number) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
        return {
          id: crypto.randomUUID(), // Generate temp ID for frontend key
          url: url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          isMain: index === 0 && !isVideo
        };
      })
    } as unknown as Product;

    return product;
  },

  create: async (product: CreateProductDTO) => {
    const formData = new FormData();
    const filesMapping: { file: File, id: string }[] = [];

    // Helper to process media and collect files
    const processMedia = (mediaList: unknown[]) => {
      return (mediaList || []).map(item => {
        const m = item as Record<string, unknown>;
        if (m.file instanceof File) {
          filesMapping.push({ file: m.file, id: m.id as string });
          return { ...m, url: `cid:${m.id}`, file: undefined };
        }
        return m;
      });
    };

    const productToSave = {
      ...product,
      media: processMedia(product.media || []),
      variants: (product.variants || []).map(v => ({
        ...v,
        media: processMedia(v.media || [])
      }))
    };

    formData.append('product', new Blob([JSON.stringify(productToSave)], { type: 'application/json' }));
    filesMapping.forEach(({ file, id }) => {
      formData.append('images', file, id);
    });

    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  update: async (id: string, product: Partial<CreateProductDTO>) => {
    const formData = new FormData();
    const filesMapping: { file: File, id: string }[] = [];

    const processMedia = (mediaList: unknown[]) => {
      return (mediaList || []).map(item => {
        const m = item as Record<string, unknown>;
        if (m.file instanceof File) {
          filesMapping.push({ file: m.file, id: m.id as string });
          return { ...m, url: `cid:${m.id}`, file: undefined };
        }
        return m;
      });
    };

    const productToUpdate = {
      ...product,
      media: processMedia(product.media || []),
      variants: (product.variants || []).map(v => ({
        ...v,
        media: processMedia(v.media || [])
      }))
    };

    formData.append('product', new Blob([JSON.stringify(productToUpdate)], { type: 'application/json' }));
    filesMapping.forEach(({ file, id }) => {
      formData.append('images', file, id);
    });

    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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

  generateDescription: async (title: string, imageUrl?: string): Promise<{ title: string, description: string }> => {
    const { data } = await api.post<{ title: string, description: string }>('/products/generate-description', { title, imageUrl });
    return data;
  }
};
