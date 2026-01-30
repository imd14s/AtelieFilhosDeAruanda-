import { api } from '../api/axios';
// CORREÇÃO AQUI: 'import type' garante que isso suma no JS final
import type { DashboardSummary, AutomationStatus } from '../types/dashboard';

export const DashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
  getAutomationStatus: async (): Promise<AutomationStatus> => {
    const { data } = await api.get<AutomationStatus>('/dashboard/automation/status');
    return data;
  },
  toggleAutomation: async (enabled: boolean) => {
    return api.post('/dashboard/automation/toggle', { enabled });
  },
  triggerTest: async () => {
    return api.post('/dashboard/automation/test-trigger');
  }
};
