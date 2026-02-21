import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Zap, MessageCircle, Star, Package } from 'lucide-react';
import SEO from '../components/SEO';
import ReviewForm from '../components/ReviewForm';

// Mock purchase data based on the screenshot style
const MOCK_ORDERS = [
    {
        id: 'ORD-20251208-001',
        dateContext: '8 de dezembro de 2025',
        status: 'DELIVERED',
        statusTitle: 'Entregue',
        statusDetail: 'Chegou no dia 15 de dezembro',
        isFull: true,
        seller: 'TRI MATE',
        items: [
            {
                productId: 'prod-1',
                productName: 'Kit Chimarrão Mate Gaúcho Bomba, Cuia Porongo, Porta Erva',
                productImage: '/images/default.png', // Fallback, will show generic image
                quantity: 1,
                variation: 'Cor: Tradicional Cabaça Porongo',
                canReview: true,
                reviewed: false,
            }
        ]
    },
    {
        id: 'ORD-20251208-002',
        dateContext: '8 de dezembro de 2025',
        status: 'DELIVERED',
        statusTitle: 'Entregue',
        statusDetail: 'Chegou no dia 16 de dezembro',
        isFull: true,
        seller: 'Loja oficial Kizumba',
        items: [
            {
                productId: 'prod-2',
                productName: 'Kit Maleta Mochila De Ferramentas Oficina Infantil Criança Com 22 Peças',
                productImage: '/images/default.png',
                quantity: 1,
                variation: '',
                canReview: true,
                reviewed: false,
            }
        ]
    },
    {
        id: 'ORD-20250407-001',
        dateContext: '7 de abril de 2025',
        status: 'DELIVERED',
        statusTitle: 'Entregue',
        statusDetail: 'Chegou no dia 10 de abril',
        isFull: false,
        seller: 'Loja oficial DUOSEG',
        items: [
            {
                productId: 'prod-3',
                productName: 'Projetor Portátil 4k Hd Android 11.0 Smart Wifi 5g Bluetooth',
                productImage: '/images/default.png',
                quantity: 1,
                variation: 'Cor: Branco, Voltagem: 127/220V',
                canReview: true,
                reviewed: false,
            }
        ]
    },
];

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [reviewItem, setReviewItem] = useState(null);
    const [reviewedItems, setReviewedItems] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/', { replace: true });
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleReviewSubmitted = (itemId) => {
        setReviewedItems(prev => new Set([...prev, itemId]));
        setReviewItem(null);
    };

    if (!user) return null;

    // Agrupar pedidos por dataContext para renderizar como os cards do Mercado Livre
    const groupedOrders = orders.reduce((acc, order) => {
        if (!acc[order.dateContext]) {
            acc[order.dateContext] = [];
        }
        acc[order.dateContext].push(order);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#ebebeb] pb-12 font-lato">
            <SEO title="Minhas Compras" description="Histórico de compras e avaliações." />

            {/* Review Modal Reutilizado */}
            {reviewItem && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setReviewItem(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[var(--azul-profundo)] transition-colors"
                        >
                            ✕
                        </button>
                        <div className="mb-6">
                            <h3 className="font-playfair text-xl text-[var(--azul-profundo)] mb-1">Avaliar Produto</h3>
                            <p className="font-lato text-sm text-gray-500">{reviewItem.productName}</p>
                        </div>
                        <ReviewForm
                            productId={reviewItem.productId}
                            onReviewSubmitted={() => handleReviewSubmitted(reviewItem.productId)}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 pt-8">
                {/* Header (Mimetiza a "Compras" do Meli) */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Compras</h1>

                {/* Filtros e Busca */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <input
                            type="text"
                            placeholder="Busque por compra, marca e mais..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <button className="flex items-center gap-1 hover:text-blue-500">
                            Categoria <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                            Data <ChevronDown size={14} />
                        </button>
                        <span className="text-gray-400 border-l border-gray-300 pl-6">{orders.length} compras</span>
                    </div>
                </div>

                {/* Banner de Pendências de Opinião */}
                <div className="bg-white rounded-md p-4 mb-6 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                            <Package size={24} className="text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-800">5 produtos esperam sua opinião</span>
                    </div>
                    <button className="px-6 py-2 bg-blue-50 text-blue-500 font-semibold text-sm rounded hover:bg-blue-100 transition-colors">
                        Opinar
                    </button>
                </div>

                {/* Lista de Compras Agrupadas por Data */}
                <div className="space-y-6">
                    {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                        <div key={date} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                            {/* Card Header (Data) */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h2 className="text-sm font-semibold text-gray-800">{date}</h2>
                                <button className="text-xs text-blue-500 hover:text-blue-600 font-semibold">
                                    Adicionar tudo ao carrinho
                                </button>
                            </div>

                            {/* Card Body (Itens do Grupo) */}
                            <div className="divide-y divide-gray-100">
                                {dateOrders.map(order => (
                                    <div key={order.id} className="p-6">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                                                {/* Esquerda: Status, Produto */}
                                                <div className="flex flex-1 gap-4">
                                                    <div className="w-20 h-20 shrink-0 border border-gray-200 rounded p-1 flex items-center justify-center overflow-hidden">
                                                        <img src={item.productImage} alt={item.productName} className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-bold text-green-600">{order.statusTitle}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mb-3">
                                                            <span className="text-sm text-gray-800 font-semibold">{order.statusDetail}</span>
                                                            {order.isFull && (
                                                                <span className="text-green-600 flex items-center text-[10px] font-bold italic ml-1 tracking-tight">
                                                                    <Zap size={10} fill="currentColor" className="mr-[1px]" /> FULL
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-2 leading-tight max-w-md">
                                                            {item.productName}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {item.quantity} un. {item.variation && `| ${item.variation}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Meio: Informações do Vendedor */}
                                                <div className="w-full md:w-1/4">
                                                    <p className="text-xs text-gray-500 mb-1">{order.seller}</p>
                                                    <button className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                                                        Enviar mensagem
                                                    </button>
                                                </div>

                                                {/* Direita: Ações */}
                                                <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
                                                    <button className="w-full py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors">
                                                        Ver compra
                                                    </button>
                                                    <button className="w-full py-2 bg-blue-50 text-blue-500 text-sm font-semibold rounded hover:bg-blue-100 transition-colors">
                                                        Comprar novamente
                                                    </button>

                                                    {item.canReview && !reviewedItems.has(item.productId) && (
                                                        <button
                                                            onClick={() => setReviewItem(item)}
                                                            className="mt-2 text-xs text-center text-gray-500 hover:text-blue-500 transition-colors"
                                                        >
                                                            Avaliar Produto
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
