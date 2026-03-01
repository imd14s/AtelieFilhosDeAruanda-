import React from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { CartItem, ShippingOption, Coupon, InstallmentOption } from '../../types';
import { getImageUrl } from '../../utils/imageUtils';

interface CheckoutSummaryProps {
    cart: CartItem[];
    subtotal: number;
    currentShipping: ShippingOption | null;
    appliedCoupon: Coupon | null;
    discount: number;
    pixDiscount: number;
    total: number;
    metodoPagamento: string;
    installmentOptions?: InstallmentOption[];
    selectedInstallment?: InstallmentOption | null;
    onSelectInstallment?: (opt: InstallmentOption) => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
    cart,
    subtotal,
    currentShipping,
    appliedCoupon,
    discount,
    pixDiscount,
    total,
    metodoPagamento,
    installmentOptions = [],
    selectedInstallment = null,
    onSelectInstallment
}) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 border border-[#0f2A44]/5 shadow-sm space-y-8">
                <h2 className="font-playfair text-2xl text-[#0f2A44]">Resumo do Pedido</h2>

                <div className="space-y-6">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4">
                            <Link to={`/produto/${item.id}`} className="flex gap-4 group cursor-pointer">
                                <div className="w-12 h-16 bg-[#F7F7F4] overflow-hidden flex-shrink-0">
                                    <img
                                        src={getImageUrl(item.image || '')}
                                        alt={item.name}
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = '/images/default.png'; }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div>
                                    <p className="font-lato text-[11px] font-bold text-[#0f2A44] uppercase line-clamp-2 group-hover:text-[#a08d5c] transition-colors duration-300">
                                        {item.name}
                                    </p>
                                    <p className="font-lato text-[10px] text-[#0f2A44]/40 mt-1">Qtd: {item.quantity}</p>
                                </div>
                            </Link>
                            <span className="font-lato text-xs text-[#0f2A44] whitespace-nowrap">
                                {formatCurrency(item.price * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#0f2A44]/5 pt-6 space-y-3">
                    <div className="flex justify-between text-[#0f2A44]/60 font-lato text-xs">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#0f2A44]/60 font-lato text-xs">
                        <div className="flex items-center gap-2">
                            <Truck size={14} className="text-[#C9A24D]" />
                            <span>Frete ({currentShipping?.provider || 'A calcular'})</span>
                        </div>
                        <span>{currentShipping ? formatCurrency(currentShipping.price) : '—'}</span>
                    </div>

                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600 font-lato text-xs font-bold">
                            <span>Desconto ({appliedCoupon.code})</span>
                            <span>-{formatCurrency(discount)}</span>
                        </div>
                    )}

                    {pixDiscount > 0 && metodoPagamento === 'pix' && (
                        <div className="flex justify-between text-green-600 font-lato text-xs font-bold">
                            <span>Desconto PIX</span>
                            <span>-{formatCurrency(pixDiscount)}</span>
                        </div>
                    )}

                    <div className="border-t border-[#0f2A44]/10 pt-4 flex justify-between items-center">
                        <span className="font-playfair text-xl text-[#0f2A44]">Total</span>
                        <div className="text-right">
                            <span className="font-playfair text-2xl text-[#C9A24D] font-bold">
                                {formatCurrency(selectedInstallment ? selectedInstallment.total_amount : total)}
                            </span>
                            {selectedInstallment && selectedInstallment.installments > 1 && (
                                <p className="font-lato text-[10px] text-[#0f2A44]/40 uppercase tracking-tighter">
                                    {selectedInstallment.installments}x de {formatCurrency(selectedInstallment.installment_amount)}
                                </p>
                            )}
                        </div>
                    </div>

                    {metodoPagamento === 'card' && installmentOptions.length > 0 && (
                        <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <label className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/60 mb-2 block">
                                Escolha o Parcelamento
                            </label>
                            <select
                                value={selectedInstallment?.installments || 1}
                                onChange={(e) => {
                                    const opt = installmentOptions.find(o => o.installments === parseInt(e.target.value));
                                    if (opt && onSelectInstallment) onSelectInstallment(opt);
                                }}
                                className="w-full bg-[#F7F7F4] border border-[#0f2A44]/10 p-4 font-lato text-xs text-[#0f2A44] outline-none focus:border-[var(--dourado-suave)] appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f2A44'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center',
                                    backgroundSize: '1em'
                                }}
                            >
                                {installmentOptions.map((opt, idx) => (
                                    <option key={idx} value={opt.installments}>
                                        {opt.recommended_message}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;
