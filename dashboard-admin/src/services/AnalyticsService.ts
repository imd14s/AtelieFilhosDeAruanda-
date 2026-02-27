import { api } from '../api/axios';

export interface DashboardMetrics {
    totalSales: number;
    totalNetProfit: number;
    totalOrders: number;
    averageTicket: number;
    cac: number;
    conversionRate: number;
    activeProducts: number;
    costBreakdown: {
        taxes: number;
        gatewayFees: number;
        logistics: number;
        productCost: number;
        netMargin: number;
    };
    salesByDate: { date: string; grossValue: number; netValue: number }[];
    topProducts: { name: string; quantity: number }[];
    available: boolean;
}

export const AnalyticsService = {
    getDashboardMetrics: async (period: '7d' | '30d' | '90d' = '30d'): Promise<DashboardMetrics> => {
        try {
            const { data } = await api.get<DashboardMetrics>(`/analytics/dashboard?period=${period}`);
            return { ...data, available: true };
        } catch {
            return {
                totalSales: 0,
                totalNetProfit: 0,
                totalOrders: 0,
                averageTicket: 0,
                cac: 0,
                conversionRate: 0,
                activeProducts: 0,
                costBreakdown: {
                    taxes: 0,
                    gatewayFees: 0,
                    logistics: 0,
                    productCost: 0,
                    netMargin: 0
                },
                salesByDate: [],
                topProducts: [],
                available: false
            };
        }
    }
};
