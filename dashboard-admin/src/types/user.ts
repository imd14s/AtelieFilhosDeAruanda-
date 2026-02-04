export type Role = 'MASTER' | 'STORE_ADMIN' | 'STORE_TEAM';

export type Permission =
    | 'CATALOG_READ' | 'CATALOG_WRITE'
    | 'ORDERS_READ' | 'ORDERS_WRITE'
    | 'FINANCIAL_READ' | 'FINANCIAL_WRITE'
    | 'SETTINGS_WRITE';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    permissions: Permission[];
    avatarUrl?: string;
    lastLogin?: string;
}

export type CreateUserDTO = Omit<User, 'id' | 'lastLogin'>;
