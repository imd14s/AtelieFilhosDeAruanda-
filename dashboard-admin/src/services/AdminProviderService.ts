import { api } from '../api/axios';
import type { AdminServiceProvider, ProviderConfig } from '../types/store-settings';

export const AdminProviderService = {
    listProviders: async (): Promise<AdminServiceProvider[]> => {
        const { data } = await api.get<AdminServiceProvider[]>('/admin/providers');
        return data;
    },

    toggleProvider: async (id: string, enabled: boolean) => {
        return api.patch(`/admin/providers/${id}/toggle`, enabled, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getProviderConfig: async (providerId: string, env: string = 'PRODUCTION'): Promise<ProviderConfig | null> => {
        try {
            const { data } = await api.get<ProviderConfig>(`/admin/provider-configs/${providerId}/${env}`);
            return data;
        } catch {
            return null;
        }
    },

    saveProviderConfig: async (config: ProviderConfig) => {
        return api.post('/admin/provider-configs', config);
    },

    createProvider: async (provider: Omit<AdminServiceProvider, 'id'>): Promise<AdminServiceProvider> => {
        const { data } = await api.post<AdminServiceProvider>('/admin/providers', provider);
        return data;
    },

    deleteProvider: async (id: string) => {
        return api.delete(`/admin/providers/${id}`);
    },

    clearShippingCeps: async (providerId: string): Promise<{ message: string }> => {
        const { data } = await api.delete(`/admin/providers/${providerId}/ceps/clear`);
        return data;
    },

    uploadShippingCepsChunk: async (providerId: string, ceps: string[]): Promise<{ message: string, migradas: number }> => {
        const { data } = await api.post(`/admin/providers/${providerId}/ceps/chunk`, ceps);
        return data;
    },

    countShippingCeps: async (providerId: string): Promise<{ totalCeps: number }> => {
        const { data } = await api.get(`/admin/providers/${providerId}/ceps/count`);
        return data;
    }
};
