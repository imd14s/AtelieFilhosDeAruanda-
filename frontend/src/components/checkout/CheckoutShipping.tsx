import React from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { ShippingOption } from '../../types';

interface CheckoutShippingProps {
    shippingLoading: boolean;
    shippingOptions: ShippingOption[];
    currentShipping: ShippingOption | null;
    onSelectShipping: (opt: ShippingOption) => void;
    configMissing: boolean;
    cepLength: number;
}

const CheckoutShipping: React.FC<CheckoutShippingProps> = ({
    shippingLoading,
    shippingOptions,
    currentShipping,
    onSelectShipping,
    configMissing,
    cepLength
}) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">4</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Escolha o Frete</h2>
            </div>

            {shippingLoading ? (
                <div className="flex items-center gap-3 text-[var(--azul-profundo)]/40 p-8 border border-dashed border-[var(--azul-profundo)]/10">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-lato text-xs uppercase tracking-widest">Calculando opções de frete...</span>
                </div>
            ) : shippingOptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shippingOptions.map((opt, i) => (
                        <label
                            key={i}
                            className={`flex items-center justify-between p-6 border cursor-pointer transition-colors ${currentShipping?.provider === opt.provider ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/30'}`}
                        >
                            <div className="flex items-center gap-4">
                                <input
                                    type="radio"
                                    name="shipping"
                                    checked={currentShipping?.provider === opt.provider}
                                    onChange={() => onSelectShipping(opt)}
                                    className="accent-[var(--azul-profundo)]"
                                />
                                <div className="flex flex-col">
                                    <span className="font-lato text-sm font-bold uppercase tracking-widest text-[var(--azul-profundo)]">{opt.provider}</span>
                                    <span className="font-lato text-[10px] text-[var(--azul-profundo)]/40">{opt.days} dias úteis</span>
                                </div>
                            </div>
                            <span className="font-lato text-sm font-bold text-[var(--azul-profundo)]">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.price)}
                            </span>
                        </label>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 p-8 border border-[var(--azul-profundo)]/5 flex flex-col items-center gap-4 text-center">
                    <Truck size={32} className="text-[var(--azul-profundo)]/10" />
                    <p className="font-lato text-xs text-[var(--azul-profundo)]/40 uppercase tracking-widest max-w-[200px]">
                        {configMissing
                            ? "Cálculo de frete em manutenção. Por favor, tente novamente mais tarde."
                            : (cepLength === 8 ? "Nenhuma opção de frete disponível para este CEP." : "Insira um CEP válido para ver as opções de frete.")
                        }
                    </p>
                </div>
            )}
        </section>
    );
};

export default CheckoutShipping;
