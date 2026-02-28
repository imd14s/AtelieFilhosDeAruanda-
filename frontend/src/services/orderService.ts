import api from './api';
import { CreateOrderData, ShippingOption, CartItem, Order, Product } from '../types';
import { TENANT_HEADER } from './productService';
import { SafeAny } from "../types/safeAny";

/**
 * Ateliê Filhos de Aruanda - Order & Shipping Service
 * Criação de pedidos, histórico e cálculo de frete.
 */

export const orderService = {
    createOrder: async (orderData: CreateOrderData): Promise<Order> => {
        try {
            const payload = {
                customerName: orderData.customerName || `${orderData.nome || ''} ${orderData.sobrenome || ''}`.trim(),
                customerEmail: orderData.customerEmail || orderData.email,
                items: (orderData.items || []).map(i => ({
                    productId: i.productId,
                    variantId: i.variantId || null,
                    quantity: i.quantity
                })),
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod || 'pix',
                paymentToken: orderData.paymentToken || null,
                cardId: orderData.cardId || null,
                saveCard: orderData.saveCard || false,
                saveAddress: orderData.saveAddress || false,
                couponCode: orderData.couponCode || null
            };

            const response = await api.post('/checkout/process', payload, {
                headers: TENANT_HEADER
            });
            return response.data;
        } catch (error) {
            console.error("[orderService] Erro ao criar pedido:", error);
            throw error;
        }
    },

    getOrderById: async (orderId: string): Promise<Order> => {
        try {
            const response = await api.get(`/orders/${orderId}`, {
                headers: TENANT_HEADER
            });
            return response.data;
        } catch (error) {
            console.error("[orderService] Erro ao buscar pedido:", error);
            throw error;
        }
    },

    calculateShipping: async (cep: string, items: CartItem[] = []): Promise<ShippingOption[]> => {
        try {
            const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const payload = {
                cep,
                subtotal,
                items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
            };

            const response = await api.post('/shipping/quote', payload, {
                headers: TENANT_HEADER
            });

            if (response.data?.options) {
                return response.data.options.map((opt: SafeAny) => ({
                    provider: opt.name,
                    price: opt.price,
                    days: opt.delivery_time,
                    originalPrice: opt.original_price,
                    free: opt.free_shipping
                }));
            }

            return [{
                provider: response.data.provider,
                price: response.data.shippingCost,
                days: response.data.estimatedDays || 5,
                free: response.data.free_shipping
            }];
        } catch (error) {
            console.error("[orderService] Erro ao calcular frete:", error);
            return [];
        }
    },

    // --- HISTÓRICO ---
    history: {
        get: async (userId: string): Promise<Product[]> => {
            if (!userId) return [];
            try {
                const response = await api.get(`/history/user/${userId}`, {
                    headers: TENANT_HEADER
                });
                return (response.data || []).map((h: SafeAny) => h.product);
            } catch (e) {
                console.error("[orderService] Erro ao buscar histórico da API", e);
                return [];
            }
        },
        add: async (userId: string, productId: string): Promise<void> => {
            if (!userId || !productId) return;
            try {
                await api.post('/history', { userId, productId }, {
                    headers: TENANT_HEADER
                });
            } catch (e) {
                console.error("[orderService] Erro ao salvar histórico na API", e);
            }
        },
        clear: async (userId: string): Promise<void> => {
            if (!userId) return;
            try {
                await api.delete(`/history/user/${userId}`, {
                    headers: TENANT_HEADER
                });
            } catch (e) {
                console.error("[orderService] Erro ao limpar histórico na API", e);
            }
        }
    }
};

export const configService = {
    getMercadoPagoPublicKey: async (): Promise<SafeAny> => {
        try {
            const response = await api.get('/config/public/mercado-pago/public-key', {
                headers: TENANT_HEADER
            });
            return response.data;
        } catch (error) {
            console.error("[configService] Erro ao buscar chave pública do Mercado Pago:", error);
            return null;
        }
    }
};
