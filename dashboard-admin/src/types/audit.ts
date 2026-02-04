export interface AuditLog {
    id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    resource: 'PRODUCT' | 'ORDER' | 'CONFIG' | 'USER' | 'TENANT';
    resourceId?: string;
    details: string;
    performedBy: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
    tenantId: string;
}
