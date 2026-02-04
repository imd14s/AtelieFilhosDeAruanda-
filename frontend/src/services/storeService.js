import api from './api';

/**
 * Ateliê Filhos de Aruanda - Store Service
 * Centraliza toda a lógica de comunicação com a API do Backend.
 */

// Header de Tenant para multi-loja (conforme especificações de integração)
const TENANT_HEADER = { 'X-Tenant-ID': 'atelie-aruanda' };

export const storeService = {
  // --- PRODUTOS ---
  /**
   * Busca lista de produtos com filtros opcionais.
   * Suporta paginação se o backend retornar objeto 'content'.
   */
  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('categoryId', filters.category);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('q', filters.search);

      const response = await api.get('/products', {
        params,
        headers: TENANT_HEADER
      });

      // Padronização: retorna sempre um array
      return response.data?.content || (Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("[storeService] Erro ao buscar produtos:", error);
      return []; // Falha graciosa conforme PROJECT_SKILLS
    }
  },

  /**
   * Busca detalhes de um produto específico.
   * Atualmente usa ID como slug.
   */
  getProductBySlug: async (id) => {
    if (!id) return null;
    try {
      const response = await api.get(`/products/${id}`, {
        headers: TENANT_HEADER
      });
      return response.data || null;
    } catch (error) {
      console.error(`[storeService] Erro ao buscar produto ${id}:`, error);
      return null;
    }
  },

  // --- CHECKOUT & FRETE ---
  /**
   * Calcula as opções de frete para um CEP e itens específicos.
   */
  calculateShipping: async (cep, items) => {
    try {
      const response = await api.post('/checkout/calculate-shipping', {
        cep,
        items: items.map(i => ({ id: i.id, quantity: i.quantity }))
      }, { headers: TENANT_HEADER });

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("[storeService] Erro ao calcular frete:", error);
      return [];
    }
  },

  /**
   * Cria um novo pedido no backend.
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/checkout/process', orderData, {
        headers: TENANT_HEADER
      });
      return response.data;
    } catch (error) {
      console.error("[storeService] Erro ao processar checkout:", error);
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
          name: product.name,
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

