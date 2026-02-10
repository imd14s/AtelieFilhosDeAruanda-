import { api } from '../api/axios';
import type { User, CreateUserDTO } from '../types/user';

// MOCK_USERS removed

export const UserService = {
    getAll: async (): Promise<User[]> => {
        const { data } = await api.get<User[]>('/admin/users');
        return data;
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
