import React from 'react';
import { PackageOpen, Clock, Settings, Search, ChevronDown, PackageCheck } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext, Link } from 'react-router-dom';

const MOCK_SUBSCRIPTIONS = [
    {
        id: 'SUB-A1B2',
        productName: 'Kit Energia Firmeza de Exu - Oferenda Mensal',
        image: '/images/default.png',
        frequency: 'A cada 30 dias',
        nextDelivery: '25 de Dezembro',
        price: 'R$ 89,90',
        status: 'ACTIVE',
        statusText: 'Ativa'
    },
    {
        id: 'SUB-C3D4',
        productName: 'Velas Palito Branca 100% Parafina - Caixa 50 Un.',
        image: '/images/default.png',
        frequency: 'A cada 15 dias',
        nextDelivery: '12 de Dezembro',
        price: 'R$ 45,00',
        status: 'PAUSED',
        statusText: 'Pausada'
    }
];

const SubscriptionsPage = () => {
    const { user } = useOutletContext();

    if (!user) return null;

    const activeCount = MOCK_SUBSCRIPTIONS.filter(sub => sub.status === 'ACTIVE').length;

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Minhas Assinaturas" description="Gerencie suas entregas recorrentes." />

            <div className="max-w-5xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Assinaturas</h1>
                        <p className="text-gray-500 text-sm mt-1">Gerencie produtos que você recebe periodicamente.</p>
                    </div>
                    {/* Botão Nova Assinatura (Ação Futura) */}
                    <Link to="/store" className="bg-blue-500 text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-blue-600 transition-colors">
                        Explorar Produtos Assináveis
                    </Link>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <input
                            type="text"
                            placeholder="Busque por produto assinado..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="text-gray-400 font-medium">{activeCount} assinaturas ativas</span>
                    </div>
                </div>

                {/* Banner Educativo */}
                <div className="bg-white rounded-md p-4 mb-6 shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 rounded-full shrink-0">
                        <PackageCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-800 font-semibold mb-1">Nunca mais fique sem axé!</p>
                        <p className="text-xs text-gray-500">Com a assinatura Ateliê, você agenda a entrega dos seus produtos de uso contínuo com desconto exclusivo. Pause ou cancele a qualquer momento.</p>
                    </div>
                </div>

                {/* Lista de Assinaturas */}
                <div className="space-y-4">
                    {MOCK_SUBSCRIPTIONS.map(sub => (
                        <div key={sub.id} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row p-6 gap-6 relative">

                            {/* Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {sub.statusText}
                                </span>
                            </div>

                            {/* Imagem do Produto */}
                            <div className="w-20 h-20 shrink-0 border border-gray-200 rounded p-1 flex items-center justify-center overflow-hidden">
                                <img src={sub.image} alt={sub.productName} className="max-w-full max-h-full object-contain" />
                            </div>

                            {/* Informações da Assinatura */}
                            <div className="flex-1">
                                <h3 className="text-gray-800 font-semibold text-base mb-1 pr-16">{sub.productName}</h3>
                                <div className="text-sm font-bold text-gray-900 mb-4">{sub.price} <span className="text-gray-400 font-normal text-xs">/ envio</span></div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>Frequência: <strong className="text-gray-800">{sub.frequency}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PackageOpen size={16} className={sub.status === 'ACTIVE' ? 'text-blue-500' : 'text-gray-400'} />
                                        <span>Próxima entrega: <strong className={sub.status === 'ACTIVE' ? 'text-blue-600' : 'text-gray-800'}>{sub.nextDelivery}</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Ações (Painel Direito) */}
                            <div className="w-full md:w-48 flex flex-col justify-end gap-2 shrink-0 md:border-l border-gray-100 md:pl-6">
                                <button className="w-full py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                    <Settings size={16} /> Modificar
                                </button>
                                {sub.status === 'ACTIVE' ? (
                                    <button className="w-full py-2 bg-white text-gray-500 border border-gray-200 text-sm font-semibold rounded hover:bg-gray-50 transition-colors">
                                        Pausar
                                    </button>
                                ) : (
                                    <button className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600 transition-colors">
                                        Reativar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionsPage;
