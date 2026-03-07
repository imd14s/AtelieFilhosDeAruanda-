import type { Order } from '../../types/order';
import BaseModal from '../../components/ui/BaseModal';
import { FileText, Truck, Calendar, CreditCard, Tag, Package, ExternalLink } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
    if (!order) return null;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PAID: 'bg-emerald-100 text-emerald-700',
            PENDING: 'bg-amber-100 text-amber-700',
            CANCELED: 'bg-rose-100 text-rose-700',
            SHIPPED: 'bg-sky-100 text-sky-700',
            DELIVERED: 'bg-violet-100 text-violet-700'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status === 'PAID' ? 'Pago' :
                    status === 'PENDING' ? 'Pendente' :
                        status === 'CANCELED' ? 'Cancelado' :
                            status === 'SHIPPED' ? 'Enviado' :
                                status === 'DELIVERED' ? 'Entregue' :
                                    status}
            </span>
        );
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Detalhes do Pedido" maxWidth="max-w-3xl">
            <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex flex-col gap-1 mb-2">
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Identificador do Pedido</span>
                            <span className="font-mono text-xs text-gray-600 font-bold bg-white px-2 py-1 rounded border border-gray-100 w-fit">
                                #{order.id}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Calendar size={16} />
                            <span className="text-sm">Realizado em: {new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Status Atual:</span>
                            {getStatusBadge(order.status)}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <CreditCard size={16} />
                            <div className="text-sm flex-1 space-y-2">
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Produtos:</span>
                                    <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount || 0)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Frete:</span>
                                    <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.shippingCost || 0)}</span>
                                </p>
                                {(order.discount && order.discount > 0) ? (
                                    <p className="flex justify-between text-emerald-600 font-bold">
                                        <span>Desconto {order.paymentMethod ? `(${order.paymentMethod})` : ''}:</span>
                                        <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.discount)}</span>
                                    </p>
                                ) : null}
                                <p className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2 mt-2 text-base">
                                    <span>Total Final:</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((order.totalAmount || 0) + (order.shippingCost || 0) - (order.discount || 0))}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 border-t border-gray-200 pt-2">
                            <Tag size={16} />
                            <span className="text-sm font-medium">Cliente: <span className="text-gray-800">{order.customerName}</span></span>
                        </div>
                    </div>
                </div>

                {/* Documentos de Envio e Fiscal */}
                <div className="border border-indigo-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-indigo-50 px-4 py-2.5 border-b border-indigo-100 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-bold text-indigo-800">Logística e Documentação</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.invoiceUrl ? (
                            <a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Nota Fiscal (NF-e)</span>
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
                            <a href={order.labelUrlMe} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100">
                                        <Truck size={20} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Etiqueta Mejor Envio</span>
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
                                <span className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Código de Rastreamento</span>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-lg text-indigo-800 font-bold tracking-wider">{order.trackingCode || 'AGUARDANDO ENVIO'}</span>
                                    {order.trackingCode && <Truck size={20} className="text-indigo-600" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Package size={18} className="text-gray-400" />
                        Produtos Adquiridos
                    </h3>
                    <div className="border rounded-xl overflow-x-auto shadow-sm">
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
                                                {(item.productImage && item.productImage.match(/\.(mp4|webm|ogg)$/i)) ? (
                                                    <video src={getImageUrl(item.productImage)} className="w-10 h-10 object-cover rounded-lg border bg-gray-100" muted loop playsInline />
                                                ) : (
                                                    <img 
                                                        src={getImageUrl(item.productImage)} 
                                                        alt={item.productName} 
                                                        className="w-10 h-10 object-cover rounded-lg border bg-gray-100" 
                                                        onError={(e: any) => {
                                                            e.target.src = '/logo.png';
                                                        }} 
                                                    />
                                                )}
                                                <span className="font-medium text-gray-800">{item.productName || 'Produto sem nome'}</span>
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
