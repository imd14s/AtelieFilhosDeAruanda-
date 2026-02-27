/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import SEO from '../components/SEO';
import ReviewForm from '../components/ReviewForm';
import api from '../services/api';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';
import { User, Order } from '../types';

interface UserContext {
    user: User | null;
}

interface ReviewItem {
    productId: string;
    productName: string;
}

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useOutletContext<UserContext>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
    const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchOrders = (userId: string) => {
        setLoading(true);
        api.get(`/orders/user/${userId}`)
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching orders:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const userId = user?.id || user?.googleId;
        if (userId) {
            fetchOrders(userId);
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleReviewSubmitted = (itemId: string) => {
        setReviewedItems(prev => new Set([...prev, itemId]));
        setReviewItem(null);
    };

    const handleAddAllToCart = (dateOrders: Order[]) => {
        dateOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const productId = item.productId || item.product?.id;
                const productName = item.productName || item.product?.name || item.name;
                const price = item.unitPrice || item.price || item.product?.price;
                const images = item.product?.images || [];

                if (productId && productName && price !== undefined) {
                    cartService.add({
                        id: productId,
                        name: productName,
                        price: price,
                        images: images
                    }, 1);
                }
            });
        });
        window.dispatchEvent(new CustomEvent('show-alert', { detail: 'Produtos adicionados ao carrinho!' }));
    };

    if (!user) return null;

    // Filtrar pedidos pela busca
    const filteredOrders = orders.filter(order =>
        !searchTerm || (order.items || []).some(item =>
            (item.productName || item.product?.name || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Agrupar pedidos por data
    const groupedOrders = filteredOrders.reduce((acc: Record<string, Order[]>, order) => {
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

            {/* Review Modal */}
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
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Compras</h1>

                {/* Busca */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <input
                            type="text"
                            placeholder="Busque por produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <span className="text-gray-400 text-sm">{filteredOrders.length} compras</span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-md border border-gray-200 shadow-sm mt-4">
                        <Package className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1.5} />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'Nenhuma compra encontrada' : 'Você ainda não fez compras'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {searchTerm ? 'Tente buscar com outros termos.' : 'Seus pedidos aparecerão aqui assim que você concluir uma compra.'}
                        </p>
                        <Link to="/store" className="bg-blue-500 text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-blue-600 transition-colors">
                            Ir para a loja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedOrders).map(([date, dateOrders]) => (
                            <div key={date} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h2 className="text-sm font-semibold text-gray-800">{date}</h2>
                                    <button
                                        onClick={() => handleAddAllToCart(dateOrders)}
                                        className="text-xs text-blue-500 hover:text-blue-600 font-semibold"
                                    >
                                        Adicionar tudo ao carrinho
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {dateOrders.map(order => (
                                        <div key={order.id} className="p-6">
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="flex flex-1 gap-4">
                                                        <div className="w-20 h-20 shrink-0 border border-gray-200 rounded p-1 flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={getImageUrl(item.productImage || (item.product?.images?.[0]) || '')}
                                                                alt={item.productName || item.product?.name || item.name || 'Produto'}
                                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/images/default.png';
                                                                }}
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold text-green-600">
                                                                    {order.status === 'DELIVERED' ? 'Entregue' :
                                                                        order.status === 'SHIPPED' ? 'Enviado' :
                                                                            order.status === 'PAID' ? 'Pago' : 'Pendente'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-800 line-clamp-2 leading-tight max-w-md">
                                                                {item.productName || item.product?.name || item.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {item.quantity} un.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
                                                        <button
                                                            onClick={() => navigate(`/perfil/compras/${order.id}`)}
                                                            className="w-full py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            Ver compra
                                                        </button>

                                                        {order.status === 'DELIVERED' && !reviewedItems.has(item.productId || item.product?.id || '') && (
                                                            <button
                                                                onClick={() => {
                                                                    const pid = item.productId || item.product?.id;
                                                                    const pName = item.productName || item.product?.name || item.name;
                                                                    if (pid && pName) {
                                                                        setReviewItem({
                                                                            productId: pid,
                                                                            productName: pName
                                                                        });
                                                                    }
                                                                }}
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
