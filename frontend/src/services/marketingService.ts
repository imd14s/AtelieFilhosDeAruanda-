import api from './api';
import { Coupon } from '../types';
import { TENANT_HEADER } from './productService';

const marketingService = {
    subscribeNewsletter: async (): Promise<any> => {
        try {
            const response = await api.post('/newsletter/subscribe', {}, { headers: TENANT_HEADER });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Erro ao assinar newsletter' };
        }
    },

    validateCoupon: async (code: string, userId: string, cartTotal: number): Promise<Coupon> => {
        try {
            const response = await api.post('/marketing/coupons/validate', {
                code,
                userId,
                cartTotal
            }, { headers: TENANT_HEADER });
            return response.data;
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Cupom inválido';
            throw new Error(msg);
        }
    },

    getAvailableCoupons: async (userId?: string): Promise<Coupon[]> => {
        try {
            const response = await api.get('/coupons/my-coupons', {
                params: userId ? { userId } : {},
                headers: TENANT_HEADER
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Erro ao buscar cupons' };
        }
    }
};

export default marketingService;
