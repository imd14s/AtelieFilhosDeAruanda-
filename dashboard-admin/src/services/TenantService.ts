import { api } from '../api/axios';
import type { Tenant, CreateTenantDTO } from '../types/tenant';

// Mock inicial para desenvolvimento frontend sem backend pronto
const MOCK_TENANTS: Tenant[] = [
    {
        id: '1',
        name: 'Loja Principal',
        slug: 'main',
        status: 'ACTIVE',
        config: { currency: 'BRL', language: 'pt-BR', timezone: 'America/Sao_Paulo' }
    },
    {
        id: '2',
        name: 'Filial SP',
        slug: 'sp-store',
        status: 'ACTIVE',
        config: { currency: 'BRL', language: 'pt-BR', timezone: 'America/Sao_Paulo' }
    }
];

export const TenantService = {
    getAll: async (): Promise<Tenant[]> => {
        try {
            const { data } = await api.get<Tenant[]>('/admin/tenants');
            return data;
        } catch {
            console.warn('Backend Tenant API not ready, using mock');
            return MOCK_TENANTS;
        }
    },

    getById: async (id: string): Promise<Tenant | undefined> => {
        try {
            const { data } = await api.get<Tenant>(`/admin/tenants/${id}`);
            return data;
        } catch {
            return MOCK_TENANTS.find(t => t.id === id);
        }
    },

    create: async (tenant: CreateTenantDTO) => {
        return api.post('/admin/tenants', tenant);
    },

    switchTenant: (tenantId: string) => {
        localStorage.setItem('current_tenant_id', tenantId);
        // Em uma implementação real, isso poderia recarregar a página ou atualizar headers do axios
        api.defaults.headers.common['X-Tenant-ID'] = tenantId;
    }
};
