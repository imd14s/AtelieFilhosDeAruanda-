import { useEffect, useState } from 'react';
import { AnalyticsService, type DashboardMetrics } from '../../services/AnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

export function DashboardHome() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadMetrics();
    }, [period]);

    const loadMetrics = async () => {
        setLoading(true);
        const data = await AnalyticsService.getDashboardMetrics(period);
        setMetrics(data);
        setLoading(false);
    };

    if (loading || !metrics) {
        return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;
    }

    const cards = [
        { label: 'Vendas Totais', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalSales), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Pedidos', value: metrics.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Ticket Médio', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.averageTicket), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Produtos Ativos', value: metrics.activeProducts, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
                    <p className="text-gray-500">Acompanhe o desempenho da sua loja</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
                    className="border rounded-lg p-2 bg-white text-sm"
                >
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="text-xl font-bold text-gray-800">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h3 className="font-semibold text-gray-800 mb-4">Vendas por Dia</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="99%" height="100%">
                            <LineChart data={metrics.salesByDate}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h3 className="font-semibold text-gray-800 mb-4">Top Produtos</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={metrics.topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
