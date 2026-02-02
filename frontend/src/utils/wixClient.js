import api from '../services/api';

// --- ADAPTADORES DE DADOS (O Segredo para manter o Design) ---

// Converte Produto Java -> Formato Visual do Wix
const adaptProductToWix = (javaProduct) => {
  const priceVal = javaProduct.price || 0;
  
  return {
    _id: javaProduct.id,
    name: javaProduct.name,
    description: javaProduct.description,
    slug: javaProduct.id, // Usando ID como slug por enquanto
    price: {
      formatted: { 
        price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceVal)
      },
      amount: priceVal
    },
    media: {
      mainMedia: {
        image: {
          url: (javaProduct.images && javaProduct.images.length > 0) 
            ? javaProduct.images[0] 
            : 'https://placehold.co/600x400?text=Sem+Imagem'
        }
      }
    },
    // Mantém compatibilidade com checagens de estoque
    stock: {
      inStock: javaProduct.stockQuantity > 0,
      quantity: javaProduct.stockQuantity
    }
  };
};

// --- SIMULAÇÃO DO CLIENTE WIX (Usando nossa API) ---

export const wixClient = {
  // 1. Módulo de Produtos
  products: {
    query: () => ({
      find: async () => {
        try {
          const response = await api.get('/products');
          // A API Java retorna Page<Product> ou List<Product>. Vamos assumir List ou Page.content
          const rawData = response.data.content || response.data; 
          const items = Array.isArray(rawData) ? rawData.map(adaptProductToWix) : [];
          return { items };
        } catch (error) {
          console.error("Erro ao buscar produtos da API Java:", error);
          return { items: [] };
        }
      },
      // Suporte a filtros básicos se necessário futuramente
      eq: () => wixClient.products.query(),
      limit: () => wixClient.products.query(),
    }),
    getProduct: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return adaptProductToWix(response.data);
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            return null;
        }
    }
  },

  // 2. Módulo de Carrinho (Implementação Local Simplificada para Transição)
  // O Wix gerenciava isso no servidor deles. Para não travar, vamos usar LocalStorage temporariamente
  // até implementarmos o endpoint /api/cart no Java.
  cart: {
    addToCart: async (productId, quantity, options) => {
      console.log("Adicionando ao carrinho local:", productId, quantity);
      
      const currentCart = JSON.parse(localStorage.getItem('temp_cart') || '{"lineItems": []}');
      
      // Busca dados do produto para ter preço e imagem
      const product = await wixClient.products.getProduct(productId);
      if (!product) throw new Error("Produto não encontrado");

      const newItem = {
        _id: Date.now().toString(), // ID do item no carrinho
        productId: productId,
        name: { original: product.name },
        quantity: quantity,
        price: product.price,
        image: product.media.mainMedia.image.url
      };

      currentCart.lineItems.push(newItem);
      localStorage.setItem('temp_cart', JSON.stringify(currentCart));
      
      // Dispara evento para atualizar Header (se houver listener)
      window.dispatchEvent(new Event('cart-updated'));
      
      return currentCart;
    }
  },

  currentCart: {
    getCurrentCart: async () => {
      return JSON.parse(localStorage.getItem('temp_cart') || '{"lineItems": []}');
    },
    removeLineItemsFromCurrentCart: async (itemIds) => {
       const cart = JSON.parse(localStorage.getItem('temp_cart') || '{"lineItems": []}');
       cart.lineItems = cart.lineItems.filter(item => !itemIds.includes(item._id));
       localStorage.setItem('temp_cart', JSON.stringify(cart));
       window.dispatchEvent(new Event('cart-updated'));
       return cart;
    },
    updateLineItemsQuantityInCurrentCart: async (items) => {
        const cart = JSON.parse(localStorage.getItem('temp_cart') || '{"lineItems": []}');
        items.forEach(update => {
            const item = cart.lineItems.find(i => i._id === update._id);
            if(item) item.quantity = update.quantity;
        });
        localStorage.setItem('temp_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        return cart;
    }
  },

  // 3. Módulo de Autenticação (Redireciona para nossa API)
  auth: {
    loggedIn: () => !!localStorage.getItem('auth_token'),
    logout: async () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.reload();
    },
    generateOAuthData: () => ({ state: 'dummy' }),
    getAuthUrl: () => ({ authUrl: '/login' }), // Redireciona para nossa página de login local
    setTokens: (tokens) => {
        // Compatibilidade com código legado que tenta setar tokens do Wix
        console.log("Ignorando setTokens do Wix Legacy");
    }
  }
};

// Funções auxiliares legadas
export const loginWithEmail = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    return user;
  } catch (error) {
    throw error;
  }
};

export const checkMemberStatus = async () => {
    return localStorage.getItem('auth_token') ? { loginEmail: 'user@atelie.com' } : null;
};

export const getWixTokens = () => ({});
