export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    detailedDescription?: string;
    price: number;
    basePrice?: number;
    frequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    active: boolean;
    features?: string[];
    type: 'FIXED' | 'CUSTOM';
    imageUrl?: string;
    products?: {
        product: {
            id: string;
            name: string;
        };
        quantity: number;
    }[];
    frequencyRules?: {
        frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
        discountPercentage: number;
    }[];
    minProducts?: number;
    maxProducts?: number;
}

export interface SubscriptionItem {
    id: string;
    subscriptionId: string;
    productId: string;
    quantity: number;
    price: number;
    product?: {
        name: string;
        imageUrl?: string;
    };
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    nextBillingAt: string;
    totalPrice: number;
    frequency: string;
    plan?: SubscriptionPlan;
    items?: SubscriptionItem[];
}
