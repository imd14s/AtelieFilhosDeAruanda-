import api from './api';
import { User, CartItem, Product } from '../types';
import { TENANT_HEADER } from './productService';

/**
 * Ateliê Filhos de Aruanda - Cart Service
 * Gerenciamento local e sincronização do carrinho.
 */

const getAuthUser = (): User | null => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
};

export const cartService = {
    get: async (): Promise<CartItem[]> => {
        const user = getAuthUser();
        const cartKey = user ? `cart_user_${user.id}` : 'cart_guest';
        let cartData = JSON.parse(localStorage.getItem(cartKey) || '[]');
        let cart = Array.isArray(cartData) ? cartData : (cartData.items || []);

        if (user) {
            try {
                const response = await api.get(`/cart/${user.id}`, {
                    headers: TENANT_HEADER
                });
                const remoteCart = response.data;
                if (remoteCart.items && remoteCart.items.length > 0) {
                    cart = remoteCart.items;
                    localStorage.setItem(cartKey, JSON.stringify(cart));
                }
            } catch (error) {
                console.error('[cartService] Erro ao buscar carrinho remoto:', error);
            }
        }
        return cart;
    },

    save: async (cart: CartItem[]): Promise<void> => {
        const user = getAuthUser();
        const cartKey = user ? `cart_user_${user.id}` : 'cart_guest';
        localStorage.setItem(cartKey, JSON.stringify(cart));

        if (user) {
            try {
                await api.post(`/cart/${user.id}/sync`, cart, {
                    headers: TENANT_HEADER
                });
            } catch (error) {
                console.error('[cartService] Erro ao sincronizar carrinho:', error);
            }
        }
        window.dispatchEvent(new Event('cart-updated'));
    },

    add: async (product: Product, quantity: number = 1, variantId: string | null = null): Promise<CartItem[]> => {
        const cart = await cartService.get();
        const vId = variantId || "";
        const existingItem = cart.find(item =>
            item.id === product.id && item.variantId === vId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name || product.title || '',
                price: product.price,
                image: product.image || (product.images && product.images[0]) || (product.media && product.media[0]?.url),
                quantity: quantity,
                variantId: vId
            });
        }

        await cartService.save(cart);
        return cart;
    },

    remove: async (productId: string, variantId: string | null = null): Promise<CartItem[]> => {
        let cart = await cartService.get();
        const vId = variantId || "";
        cart = cart.filter(item =>
            !(item.id === productId && item.variantId === vId)
        );
        await cartService.save(cart);
        return cart;
    },

    updateQuantity: async (productId: string, quantity: number, variantId: string | null = null): Promise<CartItem[]> => {
        let cart = await cartService.get();
        const vId = variantId || "";
        const item = cart.find(item =>
            item.id === productId && item.variantId === vId
        );

        if (item) {
            item.quantity = Math.max(1, quantity);
            await cartService.save(cart);
        }
        return cart;
    },

    clear: async (): Promise<void> => {
        const user = getAuthUser();
        const cartKey = user ? `cart_user_${user.id}` : 'cart_guest';
        localStorage.removeItem(cartKey);

        if (user) {
            try {
                await api.delete(`/cart/${user.id}`, {
                    headers: TENANT_HEADER
                });
            } catch (error) {
                console.error('[cartService] Erro ao limpar carrinho remoto:', error);
            }
        }
        window.dispatchEvent(new Event('cart-updated'));
    },

    migrate: async (userId: string): Promise<void> => {
        try {
            const guestCartJson = localStorage.getItem('cart_guest');
            const guestCart: CartItem[] = guestCartJson ? JSON.parse(guestCartJson) : [];
            if (guestCart.length === 0) return;

            let userCart = await cartService.get();

            guestCart.forEach(guestItem => {
                const existingItem = userCart.find(item =>
                    item.id === guestItem.id && item.variantId === guestItem.variantId
                );
                if (existingItem) {
                    existingItem.quantity += guestItem.quantity;
                } else {
                    userCart.push(guestItem);
                }
            });

            await cartService.save(userCart);
            localStorage.removeItem('cart_guest');
        } catch (e) {
            console.error("[cartService] Erro ao migrar carrinho", e);
        }
    }
};
