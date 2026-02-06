export interface Coupon {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    usageCount: number;
    usageLimit: number;
    active: boolean;
}

export interface AbandonedCartTrigger {
    delayMinutes: number;
    subject: string;
}

export interface AbandonedCartSettings {
    enabled: boolean;
    triggers: AbandonedCartTrigger[];
}

export type CreateCouponDTO = Omit<Coupon, 'id' | 'usageCount' | 'active'>;
