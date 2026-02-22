import api from './api';

const subscriptionService = {
    getPlans: () => api.get('/subscription-plans').then(r => r.data),

    getPlan: (id) => api.get(`/subscription-plans/${id}`).then(r => r.data),

    getUserSubscriptions: (userId) => api.get(`/subscriptions/my?userId=${userId}`).then(r => r.data),

    subscribe: (userId, data) => api.post(`/subscriptions?userId=${userId}`, data).then(r => r.data),

    pauseSubscription: (id) => api.patch(`/subscriptions/${id}/status?status=PAUSED`).then(r => r.data),

    resumeSubscription: (id) => api.patch(`/subscriptions/${id}/status?status=ACTIVE`).then(r => r.data),

    cancelSubscription: (id) => api.patch(`/subscriptions/${id}/status?status=CANCELLED`).then(r => r.data),
};

export default subscriptionService;
