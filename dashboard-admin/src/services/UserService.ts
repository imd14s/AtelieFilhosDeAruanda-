import { api } from '../api/axios';
import type { User, CreateUserDTO } from '../types/user';

const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Admin Master',
        email: 'admin@atelie.com',
        role: 'MASTER',
        permissions: [],
        lastLogin: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Gerente SP',
        email: 'gerente.sp@atelie.com',
        role: 'STORE_ADMIN',
        permissions: ['CATALOG_WRITE', 'ORDERS_WRITE'],
        lastLogin: new Date(Date.now() - 86400000).toISOString()
    }
];

export const UserService = {
    getAll: async (): Promise<User[]> => {
        try {
            const { data } = await api.get<User[]>('/admin/users');
            return data;
        } catch {
            return MOCK_USERS;
        }
    },

    create: async (user: CreateUserDTO) => {
        return api.post('/admin/users', user);
    },

    update: async (id: string, user: Partial<User>) => {
        return api.put(`/admin/users/${id}`, user);
    },

    delete: async (id: string) => {
        return api.delete(`/admin/users/${id}`);
    }
};
