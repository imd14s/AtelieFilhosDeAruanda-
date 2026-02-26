export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    active: boolean;
    features?: string[];
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
    nextBillingDate: string;
    plan?: SubscriptionPlan;
}
