import api from './api';

const marketingService = {
    subscribeNewsletter: async (email) => {
        try {
            const response = await api.post('/newsletter/subscribe', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Erro ao assinar newsletter' };
        }
    },

    // Future methods for coupons and subscriptions
    validateCoupon: async (code, userId, cartTotal) => {
        try {
            const response = await api.post('/marketing/coupons/validate', {
                code,
                userId,
                cartTotal
            });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.message || 'Cupom inválido';
            throw new Error(msg);
        }
    },

    getAvailableCoupons: async () => {
        try {
            const response = await api.get('/coupons/my-coupons');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Erro ao buscar cupons' };
        }
    }
};

export default marketingService;
