import { useEffect, useState } from 'react';
import { AnalyticsService, type DashboardMetrics } from '../../services/AnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

export function DashboardHome() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadMetrics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const data = await AnalyticsService.getDashboardMetrics(period);
            setMetrics(data);
        } catch (error) {
            console.error('Erro ao carregar métricas', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !metrics) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" variant="text" />
                        <Skeleton className="h-4 w-64" variant="text" />
                    </div>
                    <Skeleton className="h-10 w-40" variant="rect" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-lg" variant="rect" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-20 mb-2" variant="text" />
                                <Skeleton className="h-6 w-32" variant="text" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[340px]">
                            <Skeleton className="h-6 w-40 mb-4" variant="text" />
                            <Skeleton className="h-64 w-full" variant="rect" />
                        </div>
                    ))}
                </div>
            </div>
        );
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

            {/* Aviso de dados indisponíveis */}
            {!metrics.available && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                        <strong>Sem dados no período selecionado.</strong> Os dados aparecerão aqui assim que houver vendas e pedidos registrados na sua loja.
                    </p>
                </div>
            )}

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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[340px]">
                    <h3 className="font-semibold text-gray-800 mb-4">Vendas por Dia</h3>
                    {metrics.salesByDate.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={metrics.salesByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                <p className="text-sm">Nenhuma venda registrada neste período</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[340px]">
                    <h3 className="font-semibold text-gray-800 mb-4">Top Produtos</h3>
                    {metrics.topProducts.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={metrics.topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                <p className="text-sm">Nenhum produto vendido neste período</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
