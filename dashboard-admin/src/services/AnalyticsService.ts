import { api } from '../api/axios';

export interface DashboardMetrics {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    activeProducts: number;
    salesByDate: { date: string; value: number }[];
    topProducts: { name: string; quantity: number }[];
}

export const AnalyticsService = {
    getDashboardMetrics: async (period: '7d' | '30d' | '90d' = '30d'): Promise<DashboardMetrics> => {
        // Tenta pegar da API, se falhar retorna dados mockados para não quebrar a UI
        try {
            const { data } = await api.get<DashboardMetrics>(`/analytics/dashboard?period=${period}`);
            return data;
        } catch (e) {
            console.warn('Analytics API unavailable, using mock fallback');
            return getMockMetrics();
        }
    }
};

function getMockMetrics(): DashboardMetrics {
    return {
        totalSales: 15430.90,
        totalOrders: 45,
        averageTicket: 342.90,
        activeProducts: 120,
        salesByDate: Array.from({ length: 7 }).map((_, i) => ({
            date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: Math.floor(Math.random() * 5000)
        })),
        topProducts: [
            { name: 'Camiseta Branca', quantity: 120 },
            { name: 'Calça Jeans', quantity: 98 },
            { name: 'Tênis Sport', quantity: 86 },
            { name: 'Boné Preto', quantity: 54 }
        ]
    };
}
