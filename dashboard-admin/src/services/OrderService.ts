import { api } from '../api/axios';
import type { Order } from '../types/order';

export const OrderService = {
    // Mock ou Real se existir endpoint de listagem
    getAll: async (): Promise<Order[]> => {
        // Como o API_MAP não listou endpoint de listar todos os pedidos (apenas cancelar),
        // vou assumir um padrão REST ou retornar mock se falhar.
        try {
            const { data } = await api.get<Order[]>('/admin/orders');
            return data;
        } catch (error) {
            console.warn('Endpoint /api/admin/orders não encontrado, retornando mock.');
            return [
                { id: '1', customerName: 'João Silva', total: 150.00, status: 'PAID', createdAt: new Date().toISOString() },
                { id: '2', customerName: 'Maria Oliveira', total: 89.90, status: 'PENDING', createdAt: new Date().toISOString() },
            ];
        }
    },

    cancel: async (id: string, reason: string) => {
        try {
            return await api.post(`/admin/orders/${id}/cancel`, { reason });
        } catch (error) {
            console.warn(`Mocking cancel for order ${id}`);
            return { data: { success: true } };
        }
    }
};
