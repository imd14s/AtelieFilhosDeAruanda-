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
