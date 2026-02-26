import { api } from '../api/axios';

export interface NcmResponse {
    code: string;
    description: string;
}

export const FiscalService = {
    async searchNcms(query: string): Promise<NcmResponse[]> {
        if (!query || query.length < 2) return [];
        const response = await api.get<NcmResponse[]>(`/api/fiscal/ncm`, {
            params: { query }
        });
        return response.data;
    }
};
