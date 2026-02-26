export interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    minPurchase?: number;
    active: boolean;
}

export interface NewsletterRegistration {
    email: string;
    name?: string;
    subscribed: boolean;
}
