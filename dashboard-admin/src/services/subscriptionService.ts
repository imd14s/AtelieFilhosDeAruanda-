import { api } from '../api/axios';

export const subscriptionService = {
    getPlans: async () => {
        const response = await api.get('/subscription-plans');
        return response.data;
    },

    createPlan: async (plan: any, imageFile?: File) => {
        const formData = new FormData();
        formData.append('plan', new Blob([JSON.stringify(plan)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await api.post('/subscription-plans', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updatePlan: async (id: string, plan: any, imageFile?: File) => {
        const formData = new FormData();
        formData.append('plan', new Blob([JSON.stringify(plan)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await api.put(`/subscription-plans/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deletePlan: async (id: string) => {
        await api.delete(`/subscription-plans/${id}`);
    }
};
