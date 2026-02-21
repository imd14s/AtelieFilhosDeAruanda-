import api from './api';

export const subscriptionService = {
    getPlans: async () => {
        const response = await api.get('/subscription-plans');
        return response.data;
    },

    createPlan: async (plan: any) => {
        const response = await api.post('/subscription-plans', plan);
        return response.data;
    },

    updatePlan: async (id: string, plan: any) => {
        const response = await api.put(`/subscription-plans/${id}`, plan);
        return response.data;
    },

    deletePlan: async (id: string) => {
        await api.delete(`/subscription-plans/${id}`);
    }
};
