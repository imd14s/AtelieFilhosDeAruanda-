import { api } from '../api/axios';

export interface FiscalIntegration {
    id?: string;
    providerName: string;
    apiKey: string;
    apiUrl?: string;
    settings?: Record<string, any>;
    active: boolean;
}

export const FiscalIntegrationService = {
    async getAll(): Promise<FiscalIntegration[]> {
        const response = await api.get('/api/fiscal-integrations');
        return response.data;
    },

    async save(data: FiscalIntegration): Promise<FiscalIntegration> {
        const response = await api.post('/api/fiscal-integrations', data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/fiscal-integrations/${id}`);
    }
};
