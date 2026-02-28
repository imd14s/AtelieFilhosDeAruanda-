import React from 'react';
import { Truck } from 'lucide-react';
import { CartItem, ShippingOption, Coupon } from '../../types';
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
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
    cart,
    subtotal,
    currentShipping,
    appliedCoupon,
    discount,
    pixDiscount,
    total,
    metodoPagamento
}) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="sticky top-32 space-y-8">
            <div className="bg-white p-8 border border-[#0f2A44]/5 shadow-sm space-y-8">
                <h2 className="font-playfair text-2xl text-[#0f2A44]">Resumo do Pedido</h2>

                <div className="space-y-6">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-16 bg-[#F7F7F4] overflow-hidden flex-shrink-0">
                                    <img
                                        src={getImageUrl(item.image || '')}
                                        alt={item.name}
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = '/images/default.png'; }}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-lato text-[11px] font-bold text-[#0f2A44] uppercase line-clamp-2">{item.name}</p>
                                    <p className="font-lato text-[10px] text-[#0f2A44]/40">Qtd: {item.quantity}</p>
                                </div>
                            </div>
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
                        <span className="font-playfair text-2xl text-[#C9A24D] font-bold">{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;
