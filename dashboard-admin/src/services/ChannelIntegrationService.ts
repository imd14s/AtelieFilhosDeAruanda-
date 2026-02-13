import { api } from '../api/axios';

export const ChannelIntegrationService = {
    async getStatus(provider: string) {
        const response = await api.get(`/integrations/${provider}/status`);
        return response.data;
    },

    async saveCredentials(provider: string, credentials: Record<string, string>) {
        const response = await api.post(`/integrations/${provider}/credentials`, credentials);
        return response.data;
    },

    async getAuthUrl(provider: string, redirectUri: string) {
        const response = await api.get(`/integrations/${provider}/auth-url`, {
            params: { redirectUri }
        });
        return response.data;
    },

    async testConnection(provider: string, credentials: Record<string, string>) {
        const response = await api.post(`/integrations/${provider}/test-connection`, credentials);
        return response.data;
    },

    async getAvailableProviders() {
        const response = await api.get('/admin/providers');
        return response.data;
    }
};
