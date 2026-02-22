import api from './api';

const addressService = {
    list: (userId) => api.get(`/addresses/user/${userId}`).then(r => r.data),

    create: (userId, address) => api.post(`/addresses/user/${userId}`, address).then(r => r.data),

    update: (userId, addressId, address) =>
        api.put(`/addresses/${addressId}/user/${userId}`, address).then(r => r.data),

    delete: (userId, addressId) =>
        api.delete(`/addresses/${addressId}/user/${userId}`).then(r => r.data),
};

export default addressService;
