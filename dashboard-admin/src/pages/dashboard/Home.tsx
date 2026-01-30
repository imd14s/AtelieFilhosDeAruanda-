import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';
// CORREÇÃO AQUI: 'import type'
import type { DashboardSummary } from '../../types/dashboard';

export function DashboardHome() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, autoStatus] = await Promise.all([
        DashboardService.getSummary(),
        DashboardService.getAutomationStatus()
      ]);
      setSummary(summaryData);
      setAutomationEnabled(autoStatus.enabled);
    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = async () => {
    try {
      await DashboardService.toggleAutomation(!automationEnabled);
      setAutomationEnabled(!automationEnabled);
    } catch (error) {
      alert('Erro ao alterar automação');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Carregando painel de controle...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
          <p className="text-gray-500">Ateliê Filhos de Aruanda</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-gray-600">Automação (n8n/Webhooks)</span>
          <button
            onClick={handleToggleAutomation}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              automationEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                automationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Vendas Totais (Pagas)</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary?.totalSales || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Aguardando Envio</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {summary?.pendingOrders || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Produtos com Estoque Baixo</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {summary?.lowStockAlerts || 0}
          </p>
          <span className="text-xs text-gray-400">Abaixo de 10 unidades</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="flex gap-4">
            <button 
                onClick={() => DashboardService.triggerTest()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium">
                🔔 Testar Alerta de Estoque (n8n)
            </button>
            <button className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition text-sm font-medium">
                📦 Criar Novo Produto
            </button>
        </div>
      </div>
    </div>
  );
}
