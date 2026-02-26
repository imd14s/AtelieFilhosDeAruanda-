import api from './api';
import { SubscriptionPlan, UserSubscription } from '../types';
import { TENANT_HEADER } from './productService';

const subscriptionService = {
    getPlans: (): Promise<SubscriptionPlan[]> =>
        api.get('/subscription-plans', { headers: TENANT_HEADER }).then(r => r.data),

    getPlan: (id: string): Promise<SubscriptionPlan> =>
        api.get(`/subscription-plans/${id}`, { headers: TENANT_HEADER }).then(r => r.data),

    getUserSubscriptions: (userId: string): Promise<UserSubscription[]> =>
        api.get(`/subscriptions/my?userId=${userId}`, { headers: TENANT_HEADER }).then(r => r.data),

    subscribe: (userId: string, data: any): Promise<UserSubscription> =>
        api.post(`/subscriptions?userId=${userId}`, data, { headers: TENANT_HEADER }).then(r => r.data),

    pauseSubscription: (id: string): Promise<any> =>
        api.patch(`/subscriptions/${id}/status?status=PAUSED`, {}, { headers: TENANT_HEADER }).then(r => r.data),

    resumeSubscription: (id: string): Promise<any> =>
        api.patch(`/subscriptions/${id}/status?status=ACTIVE`, {}, { headers: TENANT_HEADER }).then(r => r.data),

    cancelSubscription: (id: string): Promise<any> =>
        api.patch(`/subscriptions/${id}/status?status=CANCELLED`, {}, { headers: TENANT_HEADER }).then(r => r.data),
};

export default subscriptionService;
