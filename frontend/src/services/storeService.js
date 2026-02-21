import api from './api';

/**
 * Ateliê Filhos de Aruanda - Store Service
 * Centraliza toda a lógica de comunicação com a API do Backend.
 */

// Header de Tenant para multi-loja (conforme especificações de integração)
const TENANT_HEADER = { 'X-Tenant-ID': 'atelie-aruanda' };

/**
 * Normaliza o objeto de produto da API para campos usados pelo frontend.
 * A entidade retorna: title (=name), stock (=stockQuantity), category (UUID)
 */
const normalizeProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    // Título: API serializa `name` como `title`
    name: p.title || p.name || '',
    // Stock: API serializa `stockQuantity` como `stock`
    stockQuantity: p.stock ?? p.stockQuantity ?? 0,
    // category: API pode retornar como UUID direto no campo `category`
    categoryId: p.categoryId || (typeof p.category === 'string' ? p.category : p.category?.id) || null,
    // averageRating e totalReviews não existem ainda no backend — defaults
    averageRating: p.averageRating ?? null,
    totalReviews: p.totalReviews ?? 0,
    // Normalizar variantes
    variants: (p.variants || []).map(v => ({
      ...v,
      // variant stockQuantity também vem como `stock` às vezes
      stockQuantity: v.stockQuantity ?? v.stock ?? 0,
    }))
  };
};

export const storeService = {
  // --- PRODUTOS ---
  /**
   * Busca lista de produtos com filtros opcionais.
   * Suporta paginação se o backend retornar objeto 'content'.
   * Filtros suportados: categoryId, slug, sort, search
   */
  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.category) params.append('categoryId', filters.category); // Backward compatibility
      if (filters.slug) params.append('slug', filters.slug);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('q', filters.search);

      // Default to LOJA_VIRTUAL if no specific marketplace requested (storefront logic)
      if (!filters.marketplace) params.append('marketplace', 'LOJA_VIRTUAL');
      else params.append('marketplace', filters.marketplace);

      const response = await api.get('/products', {
        params,
        headers: TENANT_HEADER
      });

      // Padronização: retorna sempre um array normalizado
      const raw = response.data?.content || (Array.isArray(response.data) ? response.data : []);
      return raw.map(normalizeProduct);
    } catch (error) {
      console.error("[storeService] Erro ao buscar produtos:", error);
      throw error;
    }
  },

  /**
   * Busca os detalhes de um produto específico pelo ID.
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`, {
        headers: TENANT_HEADER
      });
      return normalizeProduct(response.data);
    } catch (error) {
      console.error(`[storeService] Erro ao buscar produto ${id}:`, error);
      throw error;
    }
  },

  // --- CATEGORIAS ---

  /**
   * Busca todas as categorias disponíveis.
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories', {
        headers: TENANT_HEADER
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("[storeService] Erro ao buscar categorias:", error);
      return [];
    }
  },

  // --- CARRINHO (Gerenciamento Local) ---
  cart: {
    get: () => {
      try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : { items: [] };
      } catch (e) {
        console.error("[storeService] Erro ao ler carrinho do localStorage", e);
        return { items: [] };
      }
    },

    add: (product, quantity = 1) => {
      if (!product || !product.id) return;

      const cart = storeService.cart.get();
      const existingItem = cart.items.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          id: product.id,
          name: product.title || product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity: quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    },

    remove: (productId) => {
      const cart = storeService.cart.get();
      cart.items = cart.items.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    },

    clear: () => {
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
    }
  },

  // --- AUTENTICAÇÃO ---
  auth: {
    login: async (email, password) => {
      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data?.token) {
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user || { email }));
          return response.data.user || { email };
        }
        throw new Error("Resposta de login inválida");
      } catch (error) {
        console.error("[storeService] Erro no login:", error);
        throw error; // Repassa o erro para o componente UI tratar
      }
    },

    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirecionamento limpo
    },

    getUser: () => {
      try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        return null;
      }
    },

    isAuthenticated: () => !!localStorage.getItem('auth_token')
  }
};
