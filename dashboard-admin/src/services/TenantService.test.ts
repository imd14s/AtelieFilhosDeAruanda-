/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from './TenantService';
import { api } from '../api/axios';

vi.mock('../api/axios', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        defaults: {
            headers: {
                common: {}
            }
        }
    }
}));

describe('TenantService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should fetch all tenants via API', async () => {
        const mockTenants = [{ id: '3', name: 'Test Tenant' }];
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockTenants });

        const result = await TenantService.getAll();
        expect(result).toEqual(mockTenants);
        expect(api.get).toHaveBeenCalledWith('/admin/tenants');
    });

    it('should fallback to mock on API error for getAll', async () => {
        (api.get as import('vitest').Mock).mockRejectedValueOnce(new Error('API Down'));

        const result = await TenantService.getAll();
        expect(result.length).toBe(2);
        expect(result[0]!.id).toBe('1');
    });

    it('should get tenant by id via API', async () => {
        const mockTenant = { id: '3', name: 'Test Tenant' };
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockTenant });

        const result = await TenantService.getById('3');
        expect(result).toEqual(mockTenant);
        expect(api.get).toHaveBeenCalledWith('/admin/tenants/3');
    });

    it('should fallback to mock on API error for getById', async () => {
        (api.get as import('vitest').Mock).mockRejectedValueOnce(new Error('API Down'));

        const result = await TenantService.getById('1');
        expect(result?.name).toBe('Loja Principal');
    });

    it('should create tenant', async () => {
        const newTenant = { name: 'Novo', slug: 'novo', config: { currency: 'BRL', language: 'pt-BR', timezone: 'America/Sao_Paulo' } };
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: { id: '4' } });

        await TenantService.create(newTenant as any);
        expect(api.post).toHaveBeenCalledWith('/admin/tenants', newTenant);
    });

    it('should switch tenant', () => {
        TenantService.switchTenant('5');
        expect(localStorage.getItem('current_tenant_id')).toBe('5');
        expect(api.defaults.headers.common['X-Tenant-ID']).toBe('5');
    });
});
