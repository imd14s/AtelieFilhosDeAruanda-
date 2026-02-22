import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ChevronLeft, Package, Truck, CreditCard, MapPin, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { storeService } from '../services/storeService';

const statusMap = {
    PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    PAID: { label: 'Pago', color: 'bg-blue-100 text-blue-700', icon: CreditCard },
    SHIPPED: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const { user } = useOutletContext();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            storeService.getOrderById(id)
                .then(data => setOrder(data))
                .catch(() => setError('Pedido não encontrado.'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [id]);

    if (!user) return null;

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-500" size={28} />
        </div>
    );

    if (error || !order) return (
        <div className="max-w-4xl mx-auto px-4 pt-8 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{error || 'Pedido não encontrado'}</h2>
            <Link to="/perfil/compras" className="text-blue-500 text-sm hover:underline">← Voltar para compras</Link>
        </div>
    );

    const status = statusMap[order.status] || statusMap.PENDING;
    const StatusIcon = status.icon;
    const total = order.totalAmount || order.total || 0;
    const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title={`Pedido #${order.id?.slice(0, 8) || ''}`} />

            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Breadcrumb */}
                <Link to="/perfil/compras" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors mb-6">
                    <ChevronLeft size={16} /> Voltar para Compras
                </Link>

                {/* Header */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 mb-1">
                                Pedido #{order.id?.slice(0, 8).toUpperCase() || order.externalId || '—'}
                            </h1>
                            <p className="text-sm text-gray-500">{createdAt}</p>
                        </div>
                        <span className={`px-3 py-1.5 text-xs uppercase font-bold tracking-wider rounded flex items-center gap-1.5 w-fit ${status.color}`}>
                            <StatusIcon size={14} />
                            {status.label}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Itens do Pedido */}
                    <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Package size={16} /> Itens do Pedido
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {(order.items || []).map((item, idx) => (
                                <div key={idx} className="p-6 flex items-center gap-4">
                                    <div className="w-16 h-16 shrink-0 border border-gray-200 rounded p-1 flex items-center justify-center overflow-hidden bg-gray-50">
                                        <img
                                            src={item.productImage || item.product?.images?.[0] || '/images/default.png'}
                                            alt={item.productName || item.product?.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {item.productName || item.product?.name || item.product?.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Qtd: {item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal || (item.unitPrice * item.quantity) || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Painel Lateral */}
                    <div className="space-y-4">
                        {/* Resumo Financeiro */}
                        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Resumo</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                                </div>
                                {order.shippingCost !== undefined && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Frete</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.shippingCost || 0)}</span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Desconto</span>
                                        <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-800 font-bold text-base pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total + (order.shippingCost || 0) - (order.discount || 0))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <MapPin size={14} /> Endereço de Entrega
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{order.shippingAddress}</p>
                            </div>
                        )}

                        {/* Pagamento */}
                        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <CreditCard size={14} /> Pagamento
                            </h3>
                            <p className="text-sm text-gray-600">
                                {order.paymentMethod === 'pix' ? '💎 PIX' : '💳 Cartão de Crédito'}
                            </p>
                            {order.paymentStatus && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Status: {order.paymentStatus === 'APPROVED' ? 'Aprovado' : order.paymentStatus}
                                </p>
                            )}
                        </div>

                        {/* Rastreio */}
                        {order.trackingCode && (
                            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Truck size={14} /> Rastreio
                                </h3>
                                <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded">{order.trackingCode}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
