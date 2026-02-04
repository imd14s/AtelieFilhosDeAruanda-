import { api } from '../api/axios';
import type { ShippingProvider } from '../types/store-settings';

export const ShippingService = {
    getAll: async (): Promise<ShippingProvider[]> => {
        const { data } = await api.get<ShippingProvider[]>('/settings/shipping');
        return data;
    },

    update: async (id: string, provider: Partial<ShippingProvider>) => {
        return api.put(`/settings/shipping/${id}`, provider);
    },

    toggle: async (id: string, enabled: boolean) => {
        return api.patch(`/settings/shipping/${id}/toggle`, { enabled });
    }
};
