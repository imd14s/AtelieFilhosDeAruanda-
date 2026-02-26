import api from './api';
import { Product, Category, Variant } from '../types';

/**
 * Ateliê Filhos de Aruanda - Product Service
 * Lógica de busca de produtos e categorias.
 */

export const TENANT_HEADER = { 'X-Tenant-ID': 'atelie-aruanda' };

/**
 * Normaliza o objeto de produto da API para campos usados pelo frontend.
 */
export const normalizeProduct = (p: any): Product => {
    if (!p) return p;
    return {
        ...p,
        name: p.title || p.name || '',
        stockQuantity: p.stock ?? p.stockQuantity ?? 0,
        categoryId: p.categoryId || (typeof p.category === 'string' ? p.category : p.category?.id) || null,
        averageRating: p.averageRating ?? null,
        totalReviews: p.totalReviews ?? 0,
        variants: (p.variants || []).map((v: any): Variant => ({
            ...v,
            stockQuantity: v.stockQuantity ?? v.stock ?? 0,
        }))
    };
};

export interface ProductFilters {
    categoryId?: string;
    category?: string;
    slug?: string;
    sort?: string;
    search?: string;
    marketplace?: string;
}

export const productService = {
    /**
     * Busca lista de produtos com filtros opcionais.
     */
    getProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
        try {
            const params = new URLSearchParams();
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.category) params.append('categoryId', filters.category);
            if (filters.slug) params.append('slug', filters.slug);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.search) params.append('q', filters.search);

            if (!filters.marketplace) params.append('marketplace', 'LOJA_VIRTUAL');
            else params.append('marketplace', filters.marketplace);

            const response = await api.get('/products', {
                params,
                headers: TENANT_HEADER
            });

            const raw = response.data?.content || (Array.isArray(response.data) ? response.data : []);
            return raw.map(normalizeProduct);
        } catch (error) {
            console.error("[productService] Erro ao buscar produtos:", error);
            throw error;
        }
    },

    /**
     * Busca os detalhes de um produto específico pelo ID.
     */
    getProductById: async (id: string): Promise<Product> => {
        try {
            const response = await api.get(`/products/${id}`, {
                headers: TENANT_HEADER
            });
            return normalizeProduct(response.data);
        } catch (error) {
            console.error(`[productService] Erro ao buscar produto ${id}:`, error);
            throw error;
        }
    },

    /**
     * Busca todas as categorias disponíveis.
     */
    getCategories: async (): Promise<Category[]> => {
        try {
            const response = await api.get('/categories', {
                headers: TENANT_HEADER
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error("[productService] Erro ao buscar categorias:", error);
            return [];
        }
    },

    /**
     * Busca as avaliações de um produto específico.
     */
    getReviews: async (productId: string): Promise<any[]> => {
        try {
            const response = await api.get(`/reviews/product/${productId}`, {
                headers: TENANT_HEADER
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error(`[productService] Erro ao buscar reviews do produto ${productId}:`, error);
            return [];
        }
    },
    /**
     * Cria uma nova avaliação para um produto.
     */
    createReview: async (reviewData: any): Promise<any> => {
        try {
            const response = await api.post('/reviews', reviewData, {
                headers: TENANT_HEADER
            });
            return response.data;
        } catch (error) {
            console.error("[productService] Erro ao criar review:", error);
            throw error;
        }
    }
};
