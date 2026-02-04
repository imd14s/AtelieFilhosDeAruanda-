import { useEffect, useState } from 'react';
import { OrderService } from '../../services/OrderService';
import type { Order } from '../../types/order';
import { Ban } from 'lucide-react';

export function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await OrderService.getAll();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders', error);
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
            console.error('Failed to cancel order', error);
            alert('Erro ao cancelar pedido. Verifique o console.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
                    <p className="text-gray-500">Gerencie os pedidos da loja</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando pedidos...</div>
                ) : (
                    <table className="w-full text-left">
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
                            {orders.map((order) => (
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
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {order.status !== 'CANCELED' && (
                                            <button
                                                onClick={() => handleCancelClick(order.id)}
                                                className="text-red-500 hover:text-red-700 transition flex items-center gap-1 justify-end w-full"
                                                title="Cancelar Pedido"
                                            >
                                                <Ban size={18} />
                                                <span className="text-xs font-semibold">Cancelar</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
