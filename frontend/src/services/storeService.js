import api from './api';

export const storeService = {
  // --- PRODUTOS ---
  getProducts: async (filters = {}) => {
    try {
      // Passa filtros como query params para o Java
      const params = new URLSearchParams();
      if (filters.category) params.append('categoryId', filters.category);
      // Aqui poderíamos passar sort e page também
      
      const response = await api.get('/products', { params });
      return response.data.content || response.data; // Suporta Page<> ou List<>
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  getProductBySlug: async (slug) => {
    // Como ainda não temos busca por slug no Java, vamos buscar pelo ID (que estamos usando como slug temporário)
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      return null;
    }
  },

  // --- CATEGORIAS ---
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  },

  // --- CARRINHO (Gerenciamento Local) ---
  cart: {
    get: () => {
      return JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    },
    
    add: (product, quantity = 1) => {
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
      window.dispatchEvent(new Event('cart-updated')); // Notifica o Header
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
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.reload();
    },
    getUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
    isAuthenticated: () => !!localStorage.getItem('auth_token')
  }
};
