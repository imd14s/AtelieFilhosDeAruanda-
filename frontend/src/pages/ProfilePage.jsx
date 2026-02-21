import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Star, ChevronRight, X, CheckCircle, LogOut } from 'lucide-react';
import SEO from '../components/SEO';
import ReviewForm from '../components/ReviewForm';

// Mock purchase data para testar a funcionalidade
const MOCK_ORDERS = [
    {
        id: 'ORD-20250215-001',
        date: '2025-02-15T10:00:00Z',
        status: 'DELIVERED',
        statusLabel: 'Entregue',
        total: 60.00,
        items: [
            {
                productId: 'prod-1',
                productName: 'Chapéu de Couro Artesanal do Cangaço',
                productImage: '/images/default.png',
                quantity: 1,
                price: 60.00,
                canReview: true,
                reviewed: false,
            }
        ]
    }
];

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [reviewItem, setReviewItem] = useState(null); // Item being reviewed
    const [reviewedItems, setReviewedItems] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            // Usuário não logado: redireciona para home com alerta
            navigate('/', { replace: true });
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleReviewSubmitted = (itemId) => {
        setReviewedItems(prev => new Set([...prev, itemId]));
        setReviewItem(null);
    };

    if (!user) return null;

    const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO title="Meu Perfil" description="Gerencie suas compras e avaliações." />

            {/* Review Modal */}
            {reviewItem && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setReviewItem(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[var(--azul-profundo)] transition-colors"
                        >
                            <X size={20} />
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

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header do Perfil */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-[var(--azul-profundo)]/20" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[var(--azul-profundo)]/10 flex items-center justify-center">
                                    <span className="font-playfair text-2xl text-[var(--azul-profundo)]">{user.name?.[0]?.toUpperCase()}</span>
                                </div>
                            )}
                            <div>
                                <h1 className="font-playfair text-2xl text-[var(--azul-profundo)]">{user.name}</h1>
                                <p className="font-lato text-sm text-gray-400">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-[10px] font-lato uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={14} />
                            Sair
                        </button>
                    </div>
                </div>

                {/* Minhas Compras */}
                <div>
                    <h2 className="font-playfair text-xl text-[var(--azul-profundo)] uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Package size={20} className="text-[#C9A24D]" />
                        Minhas Compras
                    </h2>

                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header do Pedido */}
                                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="font-lato text-[10px] uppercase tracking-widest text-gray-400">Pedido</p>
                                            <p className="font-lato text-sm font-bold text-[var(--azul-profundo)]">{order.id}</p>
                                        </div>
                                        <div>
                                            <p className="font-lato text-[10px] uppercase tracking-widest text-gray-400">Data</p>
                                            <p className="font-lato text-sm text-[var(--azul-profundo)]">{formatDate(order.date)}</p>
                                        </div>
                                        <div>
                                            <p className="font-lato text-[10px] uppercase tracking-widest text-gray-400">Total</p>
                                            <p className="font-lato text-sm font-bold text-[var(--azul-profundo)]">{formatCurrency(order.total)}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-lato uppercase tracking-widest px-3 py-1.5 rounded-full font-bold
                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                  `}>
                                        {order.status === 'DELIVERED' && <CheckCircle size={11} />}
                                        {order.statusLabel}
                                    </span>
                                </div>

                                {/* Itens do Pedido */}
                                <div className="divide-y divide-gray-50">
                                    {order.items.map((item, idx) => {
                                        const alreadyReviewed = reviewedItems.has(item.productId);
                                        return (
                                            <div key={idx} className="flex items-center gap-5 px-6 py-5">
                                                <div className="w-16 h-16 shrink-0 rounded-sm overflow-hidden border border-gray-100">
                                                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-lato text-sm font-medium text-[var(--azul-profundo)]">{item.productName}</p>
                                                    <p className="font-lato text-xs text-gray-400 mt-0.5">Qtd: {item.quantity} · {formatCurrency(item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <Link
                                                        to={`/produto/${item.productId}`}
                                                        className="text-[10px] font-lato uppercase tracking-widest text-gray-400 hover:text-[var(--azul-profundo)] transition-colors flex items-center gap-1"
                                                    >
                                                        Ver produto <ChevronRight size={12} />
                                                    </Link>
                                                    {item.canReview && order.status === 'DELIVERED' && (
                                                        alreadyReviewed ? (
                                                            <span className="flex items-center gap-1.5 text-[10px] font-lato uppercase tracking-widest text-green-600">
                                                                <CheckCircle size={12} /> Avaliado
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setReviewItem(item)}
                                                                className="bg-[var(--azul-profundo)] text-white px-5 py-2.5 font-lato text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#C9A24D] transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                                            >
                                                                <Star size={12} fill="currentColor" />
                                                                Avaliar Produto
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
