export interface Tenant {
    id: string;
    name: string;
    slug: string; // subdomain or path identifier
    status: 'ACTIVE' | 'ONBOARDING' | 'PAUSED';
    logoUrl?: string;
    config: {
        currency: string;
        language: string;
        timezone: string;
    };
}

export type CreateTenantDTO = Omit<Tenant, 'id' | 'status'>;
