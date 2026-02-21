import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, ChevronDown, Zap, MessageCircle, Star, Package } from 'lucide-react';
import SEO from '../components/SEO';
import ReviewForm from '../components/ReviewForm';
import api from '../services/api';

// MOCK_ORDERS removed

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewItem, setReviewItem] = useState(null);
    const [reviewedItems, setReviewedItems] = useState(new Set());

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = () => {
        setLoading(true);
        api.get(`/orders/user/${user.id}`)
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching orders:", err);
                setLoading(false);
            });
    };

    const handleReviewSubmitted = (itemId) => {
        setReviewedItems(prev => new Set([...prev, itemId]));
        setReviewItem(null);
    };

    if (!user) return null;

    // Agrupar pedidos por data para renderizar como os cards do Mercado Livre
    const groupedOrders = orders.reduce((acc, order) => {
        const dateKey = new Date(order.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(order);
        return acc;
    }, {});

    return (
        <div className="w-full pb-12">
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

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-md border border-gray-200 shadow-sm mt-4">
                        <Package className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1.5} />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Você ainda não fez compras</h3>
                        <p className="text-gray-500 text-sm mb-6">Seus pedidos aparecerão aqui assim que você concluir uma compra.</p>
                        <Link to="/store" className="bg-blue-500 text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-blue-600 transition-colors">
                            Ir para a loja
                        </Link>
                    </div>
                ) : (
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
                                                            <img src={item.productImage || (item.product?.images?.[0]) || '/images/default.png'} alt={item.productName || item.product?.name} className="max-w-full max-h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold text-green-600">
                                                                    {order.status === 'DELIVERED' ? 'Entregue' :
                                                                        order.status === 'SHIPPED' ? 'Enviado' :
                                                                            order.status === 'PAID' ? 'Pago' : 'Pendente'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mb-3">
                                                                <span className="text-sm text-gray-800 font-semibold">
                                                                    {order.status === 'DELIVERED' ? 'Recebido com sucesso' :
                                                                        order.status === 'SHIPPED' ? 'A caminho do seu endereço' :
                                                                            order.status === 'PAID' ? 'Preparando o envio' : 'Aguardando confirmação'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-800 line-clamp-2 leading-tight max-w-md">
                                                                {item.productName || item.product?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {item.quantity} un.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Meio: Informações do Vendedor */}
                                                    <div className="w-full md:w-1/4">
                                                        <p className="text-xs text-gray-500 mb-1">Ateliê Filhos de Aruanda</p>
                                                    </div>

                                                    {/* Direita: Ações */}
                                                    <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
                                                        <button className="w-full py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors">
                                                            Ver compra
                                                        </button>

                                                        {order.status === 'DELIVERED' && !reviewedItems.has(item.productId || item.product?.id) && (
                                                            <button
                                                                onClick={() => setReviewItem({
                                                                    productId: item.productId || item.product?.id,
                                                                    productName: item.productName || item.product?.name
                                                                })}
                                                                className="text-xs text-center text-gray-500 hover:text-blue-500 transition-colors mt-2"
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
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
