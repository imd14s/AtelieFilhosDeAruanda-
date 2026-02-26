import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Tenant } from '../types/tenant';
import { TenantService } from '../services/TenantService';
import { api } from '../api/axios';
import { useAuth } from './AuthContext';

interface TenantContextType {
    currentTenant: Tenant | null;
    tenants: Tenant[];
    isLoading: boolean;
    switchTenant: (tenantId: string) => void;
    refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({} as TenantContextType);

export function TenantProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            loadTenants();
        } else if (!isAuthLoading && !isAuthenticated) {
            setIsLoading(false);
        }
    }, [isAuthenticated, isAuthLoading]);

    const loadTenants = async () => {
        try {
            const data = await TenantService.getAll();
            setTenants(data);

            // Restaurar seleção anterior ou selecionar o primeiro
            const savedId = localStorage.getItem('current_tenant_id');
            const selected = data.find(t => t.id === savedId) || data[0];

            if (selected) {
                selectTenant(selected);
            }
        } catch (error) {
            console.error('Failed to load tenants', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectTenant = (tenant: Tenant) => {
        setCurrentTenant(tenant);
        localStorage.setItem('current_tenant_id', tenant.id);
        // Configurar header global para futuras requisições
        api.defaults.headers.common['X-Tenant-ID'] = tenant.id;
    };

    const switchTenant = (tenantId: string) => {
        const tenant = tenants.find(t => t.id === tenantId);
        if (tenant) {
            selectTenant(tenant);
            // Opcional: Recarregar a página para limpar estados antigos de produtos/pedidos
            window.location.reload();
        }
    };

    return (
        <TenantContext.Provider value={{ currentTenant, tenants, isLoading, switchTenant, refreshTenants: loadTenants }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => useContext(TenantContext);
