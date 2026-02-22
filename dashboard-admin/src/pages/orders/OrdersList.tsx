import { useEffect, useState } from 'react';
import { OrderService } from '../../services/OrderService';
import type { Order } from '../../types/order';
import { Ban, CheckCircle, Truck, Package, Search } from 'lucide-react';

export function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await OrderService.getAll();
            setOrders(data);
        } catch (error) {
            console.error('Erro ao carregar pedidos', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (id: string) => {
        setSelectedOrderId(id);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        if (!selectedOrderId) return;
        try {
            await OrderService.cancel(selectedOrderId, cancelReason);
            setOrders(orders.map(o => o.id === selectedOrderId ? { ...o, status: 'CANCELED' } : o));
            setCancelModalOpen(false);
        } catch (error) {
            console.error('Erro ao cancelar pedido', error);
            alert('Não foi possível cancelar o pedido. Tente novamente.');
        }
    };

    const handleApproveClick = async (id: string) => {
        try {
            await OrderService.approve(id);
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'PAID' } : o));
        } catch (error) {
            console.error('Erro ao aprovar pedido', error);
            alert('Não foi possível aprovar o pedido. Tente novamente.');
        }
    };

    const handleShipClick = async (id: string) => {
        if (!confirm('Confirma o envio deste pedido?')) return;
        try {
            await OrderService.ship(id);
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'SHIPPED' } : o));
        } catch (error) {
            console.error('Erro ao enviar pedido', error);
            alert('Não foi possível marcar o pedido como enviado. Tente novamente.');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
                    <p className="text-gray-500">Gerencie os pedidos da loja</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por ID ou nome do cliente..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando pedidos...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Cliente</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Total</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">Data</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package size={48} className="text-gray-200" />
                                                <p>Nenhum pedido encontrado.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-mono text-xs text-gray-500">#{order.id}</td>
                                            <td className="p-4 font-medium text-gray-800">{order.customerName}</td>
                                            <td className="p-4 text-gray-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        order.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                                                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'DELIVERED' ? 'bg-indigo-100 text-indigo-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleApproveClick(order.id)}
                                                        className="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                                                        title="Aprovar Pedido"
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span className="text-xs font-semibold">Aprovar</span>
                                                    </button>
                                                )}
                                                {order.status === 'PAID' && (
                                                    <button
                                                        onClick={() => handleShipClick(order.id)}
                                                        className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                                                        title="Marcar como Enviado"
                                                    >
                                                        <Truck size={18} />
                                                        <span className="text-xs font-semibold">Enviar</span>
                                                    </button>
                                                )}
                                                {order.status === 'SHIPPED' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Deseja marcar como ENTREGUE?')) return;
                                                            try {
                                                                await OrderService.delivered(order.id);
                                                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'DELIVERED' } : o));
                                                            } catch (err) {
                                                                alert('Não foi possível finalizar o pedido. Tente novamente.');
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-800 transition flex items-center gap-1"
                                                        title="Finalizar Pedido"
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span className="text-xs font-semibold">Finalizar</span>
                                                    </button>
                                                )}
                                                {order.status !== 'CANCELED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && (
                                                    <button
                                                        onClick={() => handleCancelClick(order.id)}
                                                        className="text-red-500 hover:text-red-700 transition flex items-center gap-1"
                                                        title="Cancelar Pedido"
                                                    >
                                                        <Ban size={18} />
                                                        <span className="text-xs font-semibold">Cancelar</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Cancelar Pedido</h3>
                        <p className="text-sm text-gray-600 mb-4">Motivo do cancelamento:</p>
                        <textarea
                            className="w-full border rounded p-2 mb-4"
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setCancelModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
