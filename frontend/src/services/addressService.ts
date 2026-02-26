import api from './api';
import { Address } from '../types';
import { TENANT_HEADER } from './productService';

const addressService = {
    list: (userId: string): Promise<Address[]> =>
        api.get(`/addresses/user/${userId}`, { headers: TENANT_HEADER }).then(r => r.data),

    create: (userId: string, address: Address): Promise<Address> =>
        api.post(`/addresses/user/${userId}`, address, { headers: TENANT_HEADER }).then(r => r.data),

    update: (userId: string, addressId: string, address: Address): Promise<Address> =>
        api.put(`/addresses/${addressId}/user/${userId}`, address, { headers: TENANT_HEADER }).then(r => r.data),

    delete: (userId: string, addressId: string): Promise<void> =>
        api.delete(`/addresses/${addressId}/user/${userId}`, { headers: TENANT_HEADER }).then(r => r.data),
};

export default addressService;
