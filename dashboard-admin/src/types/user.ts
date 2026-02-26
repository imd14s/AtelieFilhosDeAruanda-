export type Role = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    active: boolean;
    subscribedNewsletter?: boolean;
    createdAt: string;
    // Optional for compatibility if backend doesn't send them yet
    permissions?: string[];
    lastLogin?: string;
    avatarUrl?: string;
    document?: string;
}

export interface CreateUserDTO {
    name: string;
    email: string;
    password?: string; // Optional only if editing, strictly required for creation
    role: Role;
    document?: string;
}
