import React from 'react';
import { CreditCard, Loader2, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../../types';

interface CheckoutPaymentProps {
    mpLoading: boolean;
    pixActive: boolean;
    cardActive: boolean;
    pixDiscountPercent: number;
    metodoPagamento: 'pix' | 'card';
    onMetodoChange: (metodo: 'pix' | 'card') => void;
    savedCards: Card[];
    selectedCardId: string | null;
    onSelectCard: (id: string) => void;
    isAddingNewCard: boolean;
    setIsAddingNewCard: (val: boolean) => void;
    isConfigured: boolean;
    email: string;
    saveCard: boolean;
    onSetSaveCard: (val: boolean) => void;
}

const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({
    mpLoading,
    pixActive,
    cardActive,
    pixDiscountPercent,
    metodoPagamento,
    onMetodoChange,
    savedCards,
    selectedCardId,
    onSelectCard,
    isAddingNewCard,
    setIsAddingNewCard,
    isConfigured,
    email,
    saveCard,
    onSetSaveCard
}) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">5</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Pagamento</h2>
            </div>
            {mpLoading ? (
                <div className="p-8 flex justify-center">
                    <Loader2 size={32} className="animate-spin text-[var(--dourado-suave)]" />
                </div>
            ) : (
                <div className="space-y-4">
                    {pixActive && (
                        <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${metodoPagamento === 'pix' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                            <input type="radio" name="metodoPagamento" value="pix" checked={metodoPagamento === 'pix'} onChange={() => onMetodoChange('pix')} className="accent-[var(--azul-profundo)]" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm italic font-bold text-xs">PIX</div>
                                <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">
                                    Pix {pixDiscountPercent > 0 ? `com ${pixDiscountPercent}% de desconto` : ''}
                                </span>
                            </div>
                        </label>
                    )}

                    {cardActive && (
                        <label className={`flex items-center gap-4 p-6 border cursor-pointer transition-colors ${metodoPagamento === 'card' ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50'}`}>
                            <input type="radio" name="metodoPagamento" value="card" checked={metodoPagamento === 'card'} onChange={() => onMetodoChange('card')} className="accent-[var(--azul-profundo)]" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[var(--azul-profundo)] shadow-sm">
                                    <CreditCard size={20} />
                                </div>
                                <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">Cartão de Crédito / Débito</span>
                            </div>
                        </label>
                    )}

                    {metodoPagamento === 'card' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            {savedCards.length > 0 && (
                                <div className="grid grid-cols-1 gap-3">
                                    {savedCards.map(card => (
                                        <div
                                            key={card.id}
                                            onClick={() => { onSelectCard(card.id); setIsAddingNewCard(false); }}
                                            className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${selectedCardId === card.id && !isAddingNewCard ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center font-bold text-[8px] uppercase">{card.payment_method?.id || 'CARD'}</div>
                                                <div>
                                                    <p className="font-lato text-xs font-bold text-[var(--azul-profundo)]">**** **** **** {card.last_four_digits}</p>
                                                    <p className="font-lato text-[10px] text-[var(--azul-profundo)]/40">Expira em {card.expiration_month}/{card.expiration_year}</p>
                                                </div>
                                            </div>
                                            {selectedCardId === card.id && !isAddingNewCard && <Check size={14} className="text-[var(--dourado-suave)]" />}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => { setIsAddingNewCard(true); }}
                                        className={`p-4 border border-dashed flex items-center justify-center gap-2 font-lato text-[10px] uppercase tracking-widest transition-all ${isAddingNewCard ? 'border-[var(--dourado-suave)] text-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/20 text-[var(--azul-profundo)]/40 hover:border-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)]/60'}`}
                                    >
                                        + Novo Cartão
                                    </button>
                                </div>
                            )}

                            {isAddingNewCard && (
                                <div className="p-6 border border-[var(--azul-profundo)]/10 bg-white">
                                    <h3 className="font-lato text-xs font-bold uppercase tracking-widest text-[var(--azul-profundo)] mb-6 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-green-600" /> Novo Cartão via Mercado Pago
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {!isConfigured && !mpLoading ? (
                                            <div className="md:col-span-2 bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-xs flex items-start gap-3">
                                                <AlertTriangle size={18} className="shrink-0" />
                                                <div>
                                                    <p className="font-bold uppercase tracking-widest mb-1">Pagamento com Cartão Indisponível</p>
                                                    <p className="opacity-80">A configuração do Mercado Pago está pendente. Por favor, utilize PIX ou aguarde a ativação pelo administrador.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <form id="form-checkout" className="contents">
                                                <input type="hidden" id="cardholderEmail" value={email} />
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs text-gray-500 mb-1">Número do Cartão</label>
                                                    <div id="cardNumber" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 shadow-inner"></div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs text-gray-500 mb-1">Nome Impresso no Cartão</label>
                                                    <input type="text" id="cardholderName" placeholder="JOAO M SILVA" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] uppercase shadow-inner" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Validade</label>
                                                    <div id="expirationDate" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 shadow-inner"></div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">CVV</label>
                                                    <div id="securityCode" className="h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 shadow-inner"></div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Tipo de Doc.</label>
                                                    <select id="identificationType" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner"></select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Número do Doc.</label>
                                                    <input type="text" id="identificationNumber" placeholder="CPF/CNPJ" className="w-full border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Banco Emissor</label>
                                                    <select id="issuer" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner"></select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Parcelamento</label>
                                                    <select id="installments" className="w-full h-12 border border-[var(--azul-profundo)]/10 bg-gray-50 px-4 py-3 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] shadow-inner"></select>
                                                </div>
                                            </form>
                                        )}

                                        <label className="md:col-span-2 flex items-center gap-2 cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                checked={saveCard}
                                                onChange={(e) => onSetSaveCard(e.target.checked)}
                                                className="accent-[var(--azul-profundo)]"
                                            />
                                            <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60">Salvar este cartão para futuras compras</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default CheckoutPayment;
