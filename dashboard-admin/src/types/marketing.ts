export interface Coupon {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    usageCount: number;
    usageLimit: number;
    usageLimitPerUser: number;
    minPurchaseValue: number;
    ownerId?: string;
    active: boolean;
}

export interface AbandonedCartTrigger {
    delayMinutes?: number;
    subject?: string;
    content?: string;
    signatureId?: string;
}

export interface AbandonedCartSettings {
    enabled?: boolean;
    triggers?: AbandonedCartTrigger[];
}

export type CreateCouponDTO = Omit<Coupon, 'id' | 'usageCount' | 'active'> & { active?: boolean };
