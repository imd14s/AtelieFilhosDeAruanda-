import { api } from '../api/axios';
import type { AuditLog } from '../types/audit';

const MOCK_LOGS: AuditLog[] = [
    {
        id: '1',
        action: 'UPDATE',
        resource: 'PRODUCT',
        resourceId: 'prod_123',
        details: 'Alterou preço de R$ 50 para R$ 60',
        performedBy: { id: '1', name: 'Admin Master', email: 'admin@atelie.com' },
        timestamp: new Date().toISOString(),
        tenantId: '1'
    },
    {
        id: '2',
        action: 'LOGIN',
        resource: 'USER',
        details: 'Login realizado com sucesso',
        performedBy: { id: '2', name: 'Gerente SP', email: 'gerente.sp@atelie.com' },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        tenantId: '2'
    }
];

export const AuditService = {
    getAll: async (): Promise<AuditLog[]> => {
        try {
            const { data } = await api.get<AuditLog[]>('/admin/audit-logs');
            return data;
        } catch {
            return MOCK_LOGS;
        }
    }
};
