import type { Order } from '../../types/order';
import BaseModal from '../../components/ui/BaseModal';
import { FileText, Truck, Calendar, CreditCard, Tag, Package, ExternalLink } from 'lucide-react';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
    if (!order) return null;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PAID: 'bg-green-100 text-green-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            CANCELED: 'bg-red-100 text-red-700',
            SHIPPED: 'bg-blue-100 text-blue-700',
            DELIVERED: 'bg-indigo-100 text-indigo-700'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`Detalhes do Pedido #${order.id.substring(0, 8)}`}>
            <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Calendar size={16} />
                            <span className="text-sm">Data do Pedido: {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Status:</span>
                            {getStatusBadge(order.status)}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <CreditCard size={16} />
                            <span className="text-sm">Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Tag size={16} />
                            <span className="text-sm">Cliente: {order.customerName}</span>
                        </div>
                    </div>
                </div>

                {/* Documentos de Envio e Fiscal */}
                <div className="border border-indigo-100 rounded-xl overflow-hidden">
                    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-indigo-800">Documentos e Rastreamento</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.invoiceUrl ? (
                            <a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Nota Fiscal (NF-e)</span>
                                </div>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-indigo-600" />
                            </a>
                        ) : (
                            <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center gap-3 opacity-60">
                                <FileText size={20} className="text-gray-400" />
                                <span className="text-sm text-gray-500 italic">NF-e não emitida</span>
                            </div>
                        )}

                        {order.labelUrlMe ? (
                            <a href={order.labelUrlMe} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Truck size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Etiqueta Mejor Envio</span>
                                </div>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-indigo-600" />
                            </a>
                        ) : (
                            <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center gap-3 opacity-60">
                                <Truck size={20} className="text-gray-400" />
                                <span className="text-sm text-gray-500 italic">Etiqueta ME não gerada</span>
                            </div>
                        )}

                        <div className="sm:col-span-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs uppercase font-bold text-indigo-400">Código de Rastreamento</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg text-indigo-800">{order.trackingCode || 'AGUARDANDO ENVIO'}</span>
                                    {order.trackingCode && <Truck size={18} className="text-indigo-600" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Package size={18} />
                        Itens do Pedido
                    </h3>
                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 font-semibold text-gray-600">Produto</th>
                                    <th className="p-3 font-semibold text-gray-600 text-center">Qtd</th>
                                    <th className="p-3 font-semibold text-gray-600 text-right">Unitário</th>
                                    <th className="p-3 font-semibold text-gray-600 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 object-cover rounded-lg border" />
                                                <span className="font-medium text-gray-800">{item.productName}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                                        <td className="p-3 text-right text-gray-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                                        </td>
                                        <td className="p-3 text-right font-semibold text-gray-800">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
