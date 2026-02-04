import { api } from '../api/axios';
import type { Coupon, CreateCouponDTO, AbandonedCartSettings } from '../types/marketing';

export const MarketingService = {
    // Coupons
    getCoupons: async (): Promise<Coupon[]> => {
        const { data } = await api.get<Coupon[]>('/marketing/coupons');
        return data;
    },

    createCoupon: async (coupon: CreateCouponDTO) => {
        return api.post('/marketing/coupons', coupon);
    },

    toggleCoupon: async (id: string, active: boolean) => {
        return api.patch(`/marketing/coupons/${id}`, { active });
    },

    deleteCoupon: async (id: string) => {
        return api.delete(`/marketing/coupons/${id}`);
    },

    // Abandoned Cart
    getAbandonedCartSettings: async (): Promise<AbandonedCartSettings> => {
        const { data } = await api.get<AbandonedCartSettings>('/marketing/abandoned-carts');
        return data;
    },

    updateAbandonedCartSettings: async (settings: Partial<AbandonedCartSettings>) => {
        return api.put('/marketing/abandoned-carts', settings);
    }
};
