import api from './api';

/**
 * Ateliê Filhos de Aruanda - Store Service
 * Centraliza toda a lógica de comunicação com a API do Backend.
 */

// Header de Tenant para multi-loja (conforme especificações de integração)
const TENANT_HEADER = { 'X-Tenant-ID': 'atelie-aruanda' };

// Mock de produtos para fallback em caso de erro na API
const MOCK_PRODUCTS = [
  { id: 1, name: 'Vela de Sete Linhas', price: 45.90, category: 'velas', images: ['/images/velas.png'], stockQuantity: 10, description: 'Vela artesanal ritualizada para proteção e equilíbrio.' },
  { id: 2, name: 'Guia de Proteção Oxalá', price: 89.00, category: 'guias', images: ['/images/guias.png'], stockQuantity: 5, description: 'Guia confeccionada com sementes e cristais selecionados.' },
  { id: 3, name: 'Banho de Ervas Sagradas', price: 29.90, category: 'ervas', images: ['/images/ervas.png'], stockQuantity: 15, description: 'Mix de ervas naturais para limpeza espiritual.' },
  { id: 4, name: 'Incenso de Breu Branco', price: 15.00, category: 'ervas', images: ['/images/ervas.png'], stockQuantity: 20, description: 'Incenso natural de resina pura colhida na Amazônia.' },
];

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

      // Padronização: retorna sempre um array
      return response.data?.content || (Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("[storeService] Erro ao buscar produtos:", error);
      console.warn('API indisponível, usando dados mockados para demonstração.');
      // Falha graciosa conforme PROJECT_SKILLS, usando mock data
      const categoryFilter = filters.categoryId || filters.category;
      return MOCK_PRODUCTS.filter(p => !categoryFilter || p.category === categoryFilter);
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
