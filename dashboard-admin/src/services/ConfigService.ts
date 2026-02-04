import { api } from '../api/axios';
import type { SystemConfig, CreateConfigDTO } from '../types/config';

export const ConfigService = {
    getAll: async (): Promise<SystemConfig[]> => {
        const { data } = await api.get<SystemConfig[]>('/admin/configs');
        return data;
    },

    upsert: async (config: CreateConfigDTO) => {
        return api.post('/admin/configs', config);
    },

    delete: async (key: string) => {
        return api.delete(`/admin/configs/${key}`);
    }
};
