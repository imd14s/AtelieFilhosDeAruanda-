import { api } from '../api/axios';
import type { Order } from '../types/order';

export const OrderService = {
    getAll: async (): Promise<Order[]> => {
        try {
            const { data } = await api.get<any>('/orders');
            // Backend returns Page<OrderResponse>, so we extract content
            return data.content || [];
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            throw error;
        }
    },

    cancel: async (id: string, reason: string) => {
        // Backend expects raw string body for reason or nothing
        return await api.put(`/orders/${id}/cancel`, reason, {
            headers: { 'Content-Type': 'text/plain' }
        });
    },

    ship: async (id: string) => {
        return await api.put(`/orders/${id}/ship`);
    },

    approve: async (id: string) => {
        return await api.put(`/orders/${id}/approve`);
    }
};
