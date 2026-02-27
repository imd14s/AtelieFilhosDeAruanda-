

import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartService } from '../services/cartService';  
import { orderService } from '../services/orderService';  
import { getImageUrl } from '../utils/imageUtils';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';
import { CartItem } from '../types';
import { SafeAny } from "../types/safeAny";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateCart: (cart: { items: CartItem[] }) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cartItems, onUpdateCart }) => {
    const navigate = useNavigate();
    const [cep, setCep] = useState<string>('');
    const [shippingOptions, setShippingOptions] = useState<SafeAny[]>([]);
    const [shippingSelected, setShippingSelected] = useState<SafeAny | null>(null);
    const { addToast } = useToast();
    const [calculateLoading, setCalculateLoading] = useState<boolean>(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCalculateShipping = async () => {
        if (cep.length < 9) return;
        setCalculateLoading(true);
        setShippingError(null);
        try {
            const options = await orderService.calculateShipping(cep, cartItems);
            setShippingOptions(options);
            if (options.length === 0) {
                addToast("Nenhuma opção de frete disponível para este CEP.", "info");
            }
        } catch (error) {
            console.error('Erro ao calcular frete:', error);
            setShippingError('Não foi possível calcular o frete para este CEP.');
            setShippingOptions([]);
            addToast("Erro ao calcular frete. Tente novamente.", "error");
        } finally {
            setCalculateLoading(false);
        }
    };

    const removeItem = async (id: string) => {
        const updatedCart = await cartService.remove(id);
        onUpdateCart({ items: updatedCart });
    };

    const updateQuantity = async (id: string, newQty: number) => {
        if (newQty < 1) return;
        const updatedCart = await cartService.updateQuantity(id, newQty);
        onUpdateCart({ items: updatedCart });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] overflow-hidden">
            <div className="absolute inset-0 bg-[#0f2A44]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-[#F7F7F4] shadow-2xl flex flex-col">
                    <div className="px-6 py-8 border-b border-[#0f2A44]/5 flex items-center justify-between">
                        <h2 className="font-playfair text-2xl text-[#0f2A44]">Sua Sacola</h2>
                        <button onClick={onClose} className="text-[#0f2A44]/40 hover:text-[#0f2A44]">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <ShoppingBag size={48} className="text-[#0f2A44]/10 mb-4" />
                                <p className="font-lato text-sm text-[#0f2A44]/50 uppercase tracking-widest">Sua sacola está vazia</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-20 h-24 bg-white flex-shrink-0 overflow-hidden">
                                            <img
                                                src={getImageUrl(item.image || '')}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.src = '/images/default.png'; }}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <h3 className="font-playfair text-[#0f2A44] text-sm mb-1">{item.name}</h3>
                                            <p className="font-lato text-xs text-[#C9A24D] mb-3">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center border border-[#0f2A44]/10 bg-white">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-[#0f2A44]">-</button>
                                                    <span className="px-2 text-xs font-lato">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-[#0f2A44]">+</button>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} className="text-[#0f2A44]/30 hover:text-red-800 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="px-6 py-6 bg-white border-t border-[#0f2A44]/5 space-y-6">
                            {/* Cálculo de Frete */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44]/60">Calcular Frete</span>
                                    {shippingOptions.length > 0 && (
                                        <button onClick={() => { setCep(''); setShippingOptions([]); setShippingSelected(null); }} className="text-[9px] uppercase text-[#C9A24D]">Limpar</button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="00000-000"
                                        value={cep}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCep(e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9))}
                                        className="flex-1 border border-[#0f2A44]/10 px-3 py-2 font-lato text-xs focus:border-[#C9A24D] outline-none"
                                    />
                                    <Button
                                        onClick={handleCalculateShipping}
                                        isLoading={calculateLoading}
                                        disabled={cep.length < 9}
                                        className="px-4 py-2"
                                    >
                                        Calcular
                                    </Button>
                                </div>

                                {shippingError && <p className="text-red-500 text-[10px] font-lato">{shippingError}</p>}

                                {shippingOptions.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        {shippingOptions.map((opt, i) => (
                                            <label key={i} className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${shippingSelected?.provider === opt.provider ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-[#0f2A44]/5'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="shipping"
                                                        className="hidden"
                                                        checked={shippingSelected?.provider === opt.provider}
                                                        onChange={() => setShippingSelected(opt)}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-lato text-[10px] font-bold uppercase">{opt.provider}</span>
                                                        <span className="font-lato text-[9px] text-[#0f2A44]/40">{opt.days} dias úteis</span>
                                                    </div>
                                                </div>
                                                <span className="font-lato text-xs font-bold text-[#0f2A44]">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.price)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[#0f2A44]/5 pt-6 space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44]/60">Subtotal</span>
                                    <span className="font-lato text-xs text-[#0f2A44]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                                    </span>
                                </div>
                                {shippingSelected && (
                                    <div className="flex justify-between">
                                        <span className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44]/60">Frete ({shippingSelected.provider})</span>
                                        <span className="font-lato text-xs text-[#0f2A44]">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingSelected.price)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2">
                                    <span className="font-lato text-[10px] uppercase tracking-[0.2em] font-bold text-[#0f2A44]">Total</span>
                                    <span className="font-lato font-bold text-[#0f2A44] text-lg">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal + (shippingSelected?.price || 0))}
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    onClose();
                                    navigate('/checkout', { state: { shippingSelected, cep } });
                                }}
                                className="w-full py-4 group"
                            >
                                Finalizar Compra
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
