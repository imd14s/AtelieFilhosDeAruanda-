import React, { useState, useEffect } from 'react';
import { PackageOpen, Clock, Settings, Search, PackageCheck } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext, Link } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import { UserSubscription, User } from '../types';

interface UserContext {
    user: User | null;
}

const SubscriptionsPage: React.FC = () => {
    const { user } = useOutletContext<UserContext>();
    const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const userId = user?.id || user?.googleId;
        if (userId) {
            fetchSubscriptions(userId);
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchSubscriptions = (userId: string) => {
        setLoading(true);
        subscriptionService.getUserSubscriptions(userId)
            .then(data => {
                setSubscriptions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching subscriptions:", err);
                setLoading(false);
            });
    };

    const handleToggleStatus = (sub: UserSubscription) => {
        const userId = user?.id || user?.googleId;
        if (!userId) return;

        const action = sub.status === 'ACTIVE'
            ? subscriptionService.pauseSubscription(sub.id)
            : subscriptionService.resumeSubscription(sub.id);

        action
            .then(() => fetchSubscriptions(userId))
            .catch(err => console.error("Error updating status:", err));
    };

    if (!user) return null;

    const filteredSubscriptions = subscriptions.filter(sub =>
        (sub.plan?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = filteredSubscriptions.filter(sub => sub.status === 'ACTIVE').length;

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Ativa';
            case 'PAUSED': return 'Pausada';
            case 'CANCELLED': return 'Cancelada';
            default: return status;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Minhas Assinaturas" description="Gerencie suas entregas recorrentes." />

            <div className="max-w-5xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--azul-profundo)]">Assinaturas</h1>
                        <p className="text-gray-500 text-sm mt-1">Gerencie seu plano e produtos recorrentes.</p>
                    </div>
                    <Link to="/assinaturas" className="bg-[var(--dourado-suave)] text-white px-5 py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity">
                        Explorar Mais Planos
                    </Link>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <input
                            type="text"
                            placeholder="Busque pelo nome do plano..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[var(--azul-profundo)] shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="text-gray-400 font-medium">{activeCount} assinaturas ativas</span>
                    </div>
                </div>

                {/* Banner Educativo */}
                <div className="bg-white rounded-md p-4 mb-6 shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-[var(--azul-profundo)] rounded-full shrink-0">
                        <PackageCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-800 font-semibold mb-1">Assinatura Ateliê - Sistema de Planos</p>
                        <p className="text-xs text-gray-500">Você está no novo sistema de assinaturas. Gerencie seus kits e frequências abaixo.</p>
                    </div>
                </div>

                {/* Lista de Assinaturas */}
                <div className="space-y-4">
                    {filteredSubscriptions.map(sub => (
                        <div key={sub.id} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row p-6 gap-6 relative">

                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getStatusText(sub.status)}
                                </span>
                            </div>

                            {/* Detalhes do Plano */}
                            <div className="flex-1">
                                <h3 className="text-[var(--azul-profundo)] font-bold text-lg mb-1 pr-16">{sub.plan?.name}</h3>
                                <div className="text-sm font-bold text-gray-900 mb-4">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sub.totalPrice)}
                                    <span className="text-gray-400 font-normal text-xs ml-1">/ recorrência</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>Frequência: <strong className="text-gray-800">{sub.frequency}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PackageOpen size={16} className={sub.status === 'ACTIVE' ? 'text-[var(--azul-profundo)]' : 'text-gray-400'} />
                                        <span>Próxima cobrança: <strong className={sub.status === 'ACTIVE' ? 'text-[var(--azul-profundo)]' : 'text-gray-800'}>{new Date(sub.nextBillingAt).toLocaleDateString('pt-BR')}</strong></span>
                                    </div>
                                </div>

                                {/* Itens do Kit (se houver) */}
                                {sub.items && sub.items.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Produtos no Kit:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {sub.items.map(item => (
                                                <span key={item.id} className="inline-flex items-center px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600">
                                                    {item.quantity}x {item.product?.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ações */}
                            <div className="w-full md:w-48 flex flex-col justify-center gap-2 shrink-0 md:border-l border-gray-100 md:pl-6">
                                <Link
                                    to={`/assinaturas/gerenciar/${sub.id}`}
                                    className="w-full py-2 bg-blue-50 text-[var(--azul-profundo)] text-sm font-semibold rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Settings size={16} /> Configurar
                                </Link>
                                {sub.status === 'ACTIVE' ? (
                                    <button
                                        onClick={() => handleToggleStatus(sub)}
                                        className="w-full py-2 bg-white text-gray-500 border border-gray-200 text-sm font-semibold rounded hover:bg-gray-50 transition-colors"
                                    >
                                        Pausar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggleStatus(sub)}
                                        className="w-full py-2 bg-[var(--azul-profundo)] text-white text-sm font-semibold rounded hover:opacity-90 transition-opacity"
                                    >
                                        Reativar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredSubscriptions.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-md border border-dashed border-gray-300">
                            <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Nenhuma assinatura encontrada no novo sistema.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
