import api from './api';

export const ReviewService = {
    getReviews: async (params: {
        status?: string;
        ratings?: number[];
        hasMedia?: boolean;
        page?: number;
        size?: number;
    }) => {
        const response = await api.get('/admin/reviews', { params });
        return response.data;
    },

    moderateReview: async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
        const response = await api.patch(`/admin/reviews/${id}/status`, { status });
        return response.data;
    },

    respondToReview: async (id: string, response: string) => {
        const res = await api.post(`/admin/reviews/${id}/response`, { response });
        return res.data;
    },

    batchModerate: async (ids: string[], status: 'APPROVED' | 'REJECTED') => {
        const response = await api.post('/admin/reviews/batch-moderate', { ids, status });
        return response.data;
    }
};
