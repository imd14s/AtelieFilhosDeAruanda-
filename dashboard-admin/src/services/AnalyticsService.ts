import { api } from '../api/axios';

export interface DashboardMetrics {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    activeProducts: number;
    salesByDate: { date: string; value: number }[];
    topProducts: { name: string; quantity: number }[];
    available: boolean;
}

export const AnalyticsService = {
    getDashboardMetrics: async (period: '7d' | '30d' | '90d' = '30d'): Promise<DashboardMetrics> => {
        try {
            const { data } = await api.get<DashboardMetrics>(`/analytics/dashboard?period=${period}`);
            return { ...data, available: true };
        } catch {
            // Retorna dados zerados com flag de indisponibilidade
            return {
                totalSales: 0,
                totalOrders: 0,
                averageTicket: 0,
                activeProducts: 0,
                salesByDate: [],
                topProducts: [],
                available: false
            };
        }
    }
};
