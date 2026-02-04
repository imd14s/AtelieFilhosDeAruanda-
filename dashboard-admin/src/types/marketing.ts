export interface Coupon {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number; // 10% or R$ 10.00
    minValue?: number; // Pedido mínimo
    maxDiscount?: number; // Limite de desconto
    startDate: string;
    endDate?: string;
    active: boolean;
    usageCount: number;
    usageLimit?: number;
}

export interface AbandonedCartSettings {
    id: string;
    enabled: boolean;
    triggers: {
        delayMinutes: number; // 60 = 1 hora
        subject: string;
        templateId: string;
    }[];
}

export type CreateCouponDTO = Omit<Coupon, 'id' | 'usageCount'>;
