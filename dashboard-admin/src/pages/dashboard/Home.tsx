import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';
import { Package, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';

export function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // O Frontend agora calcula tudo baseando-se na lista de itens do Backend
      const data = await DashboardService.getSummaryFromProducts();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Calculando métricas...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
        <p className="text-gray-500">Ateliê Filhos de Aruanda</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total de Produtos (Real) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase">Produtos Ativos</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProducts}</p>
            </div>
            <Package className="text-blue-500 opacity-20" size={32} />
          </div>
        </div>

        {/* Card 2: Estoque Baixo (Calculado Real) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase">Alerta de Estoque</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStockAlerts}</p>
                <span className="text-xs text-gray-400">Abaixo de 10 un.</span>
            </div>
            <AlertTriangle className="text-red-500 opacity-20" size={32} />
          </div>
        </div>

        {/* Card 3: Vendas (Placeholder - Backend não tem endpoint ainda) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 opacity-60">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase">Vendas (Mês)</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">R$ --</p>
                <span className="text-xs text-gray-400">Em desenvolvimento</span>
            </div>
            <DollarSign className="text-green-500 opacity-20" size={32} />
          </div>
        </div>

         {/* Card 4: Pedidos (Placeholder) */}
         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 opacity-60">
          <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium uppercase">Pedidos Pendentes</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
                <span className="text-xs text-gray-400">Em desenvolvimento</span>
            </div>
            <ShoppingBag className="text-yellow-500 opacity-20" size={32} />
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400 text-sm">
        <p>O Backend está focado no catálogo de produtos. As funcionalidades de Vendas e Automação serão ativadas futuramente.</p>
      </div>
    </div>
  );
}
