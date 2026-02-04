import { api } from '../api/axios';
import type { PaymentProvider } from '../types/store-settings';

export const PaymentService = {
    getAll: async (): Promise<PaymentProvider[]> => {
        const { data } = await api.get<PaymentProvider[]>('/settings/payment');
        return data;
    },

    update: async (id: string, provider: Partial<PaymentProvider>) => {
        return api.put(`/settings/payment/${id}`, provider);
    },

    toggle: async (id: string, enabled: boolean) => {
        return api.patch(`/settings/payment/${id}/toggle`, { enabled });
    }
};
