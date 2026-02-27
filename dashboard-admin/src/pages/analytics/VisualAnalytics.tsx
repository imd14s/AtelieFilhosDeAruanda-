import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Target,
    ArrowUpRight, Filter
} from 'lucide-react';
import { AnalyticsService, type DashboardMetrics } from '../../services/AnalyticsService';
import clsx from 'clsx';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function VisualAnalytics() {
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const [data, setData] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const metrics = await AnalyticsService.getDashboardMetrics(period);
            setData(metrics);
            setLoading(false);
        }
        loadData();
    }, [period]);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const costData = [
        { name: 'Impostos', value: data.costBreakdown.taxes },
        { name: 'Taxas Gateway', value: data.costBreakdown.gatewayFees },
        { name: 'Logística', value: data.costBreakdown.logistics },
        { name: 'Custo de Produto', value: data.costBreakdown.productCost },
        { name: 'Lucro Líquido', value: data.costBreakdown.netMargin },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Análise Visual</h1>
                    <p className="text-gray-500">Acompanhamento de rentabilidade e performance em tempo real.</p>
                </div>

                <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {(['7d', '30d', '90d'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                period === p
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : '90 Dias'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Faturamento Bruto"
                    value={data.totalSales}
                    icon={DollarSign}
                    color="indigo"
                    suffix="R$"
                />
                <KPICard
                    title="Lucro Líquido"
                    value={data.totalNetProfit}
                    icon={TrendingUp}
                    color="emerald"
                    suffix="R$"
                    trend={12.5}
                />
                <KPICard
                    title="Ticket Médio"
                    value={data.averageTicket}
                    icon={ArrowUpRight}
                    color="amber"
                    suffix="R$"
                />
                <KPICard
                    title="Taxa de Conversão"
                    value={data.conversionRate}
                    icon={Target}
                    color="purple"
                    suffix="%"
                    trend={-2.1}
                />
            </div>

            {/* Primary Chart: Revenue vs Profit */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold text-gray-800">Faturamento vs Lucro Líquido (D+X)</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500"></span>
                            <span className="text-gray-500 font-medium">Faturamento</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-500 font-medium">Lucro Líquido</span>
                        </div>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.salesByDate}>
                            <defs>
                                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(v) => `R$${v}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(v: string | number | undefined) => v !== undefined ? `R$ ${Number(v).toLocaleString('pt-BR')}` : ''}
                            />
                            <Area
                                type="monotone"
                                dataKey="grossValue"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorGross)"
                            />
                            <Area
                                type="monotone"
                                dataKey="netValue"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={0}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição de Custos & Margem</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={costData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {costData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v: string | number | undefined) => v !== undefined ? `R$ ${Number(v).toLocaleString('pt-BR')}` : ''}
                                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CAC & More */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Métricas de Aquisição</h3>
                    <div className="space-y-6">
                        <MetricProgress
                            label="Custo de Aquisição (CAC)"
                            value={data.cac}
                            max={50} // Objetivo: manter abaixo de R$50
                            suffix="R$"
                            subtext="Média por novo cliente"
                            color="indigo"
                        />
                        <MetricProgress
                            label="Taxa de Conversão"
                            value={data.conversionRate}
                            max={5} // Objetivo: 5%
                            suffix="%"
                            subtext="Visitantes que realizam pedido"
                            color="emerald"
                        />
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl">
                                <Filter size={20} />
                                <p className="text-sm">
                                    <strong>Dica de Arquiteto:</strong> A taxa de conversão simulada está baseada no histórico de pedidos. Integre com Google Analytics para dados em tempo real.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface KPICardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: 'indigo' | 'emerald' | 'amber' | 'purple';
    suffix: string;
    trend?: number;
}

function KPICard({ title, value, icon: Icon, color, suffix, trend }: KPICardProps) {
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-2.5 rounded-xl", colorClasses[color])}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                        trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                        {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">
                    {suffix === 'R$' ? 'R$ ' : ''}
                    {value.toLocaleString('pt-BR')}
                    {suffix === '%' ? '%' : ''}
                </p>
            </div>
        </div>
    );
}

interface MetricProgressProps {
    label: string;
    value: number;
    max: number;
    suffix: string;
    subtext: string;
    color: 'indigo' | 'emerald';
}

function MetricProgress({ label, value, max, suffix, subtext, color }: MetricProgressProps) {
    const fillWidth = Math.min((value / max) * 100, 100);
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-600",
        emerald: "bg-emerald-600"
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{subtext}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                    {suffix === 'R$' ? 'R$ ' : ''}
                    {value.toLocaleString('pt-BR')}
                    {suffix}
                </p>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={clsx("h-full transition-all duration-1000", colorClasses[color])}
                    style={{ width: `${fillWidth}%` }}
                />
            </div>
        </div>
    );
}
