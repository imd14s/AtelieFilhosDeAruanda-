import api from './api';

export interface GeneratedReport {
    id: string;
    reportType: 'CSV' | 'PDF';
    period: string;
    requestedAt: string;
    completedAt?: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    downloadUrl?: string;
}

const ReportService = {
    requestReport: async (type: 'CSV' | 'PDF', period: string): Promise<GeneratedReport> => {
        const response = await api.post(`/reports/export?type=${type}&period=${period}`);
        return response.data;
    },

    getReportStatus: async (id: string): Promise<GeneratedReport> => {
        const response = await api.get(`/reports/${id}/status`);
        return response.data;
    },

    getHistory: async (): Promise<GeneratedReport[]> => {
        // Implementar endpoint de histórico se necessário, ou usar o de status individual
        const response = await api.get('/reports/history');
        return response.data;
    }
};

export default ReportService;
