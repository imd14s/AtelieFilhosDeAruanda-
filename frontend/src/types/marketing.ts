export interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    minPurchase?: number;
    minPurchaseValue?: number;
    active: boolean;
    endDate?: string;
    startDate?: string;
}

export interface NewsletterRegistration {
    email: string;
    name?: string;
    subscribed: boolean;
}
