import { api } from '../api/axios';
import type { AuditLog } from '../types/audit';

export const AuditService = {
    getAll: async (params?: {
        action?: string;
        resource?: string;
        performedBy?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<AuditLog[]> => {
        try {
            const { data } = await api.get<AuditLog[]>('/admin/audit-logs', { params });
            return data;
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            throw error;
        }
    }
};
