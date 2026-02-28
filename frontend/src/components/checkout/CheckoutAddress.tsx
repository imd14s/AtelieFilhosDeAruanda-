import React from 'react';
import { Address } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Check } from 'lucide-react';

interface CheckoutAddressProps {
    formData: {
        nome: string;
        sobrenome: string;
        endereco: string;
        cidade: string;
        estado: string;
        cep: string;
        saveAddress: boolean;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectAddress: (addr: Address) => void;
    onSetSaveAddress: (val: boolean) => void;
    isAddingNewAddress: boolean;
    setIsAddingNewAddress: (val: boolean) => void;
    selectedAddressId: string | null;
    onCalculateShipping: (cep: string) => void;
}

const CheckoutAddress: React.FC<CheckoutAddressProps> = ({
    formData,
    onChange,
    onSelectAddress,
    onSetSaveAddress,
    isAddingNewAddress,
    setIsAddingNewAddress,
    selectedAddressId,
    onCalculateShipping
}) => {
    const { user, addresses } = useAuth();

    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">3</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Endereço de Entrega</h2>
            </div>

            {addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {addresses.map(addr => (
                        <div
                            key={addr.id}
                            onClick={() => onSelectAddress(addr)}
                            className={`p-4 border cursor-pointer transition-all ${selectedAddressId === addr.id && !isAddingNewAddress ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-lato text-[10px] font-bold uppercase tracking-widest text-[var(--azul-profundo)]">{addr.street}, {addr.number}</span>
                                {selectedAddressId === addr.id && !isAddingNewAddress && <Check size={14} className="text-[var(--dourado-suave)]" />}
                            </div>
                            <p className="font-lato text-xs text-[var(--azul-profundo)]/60 line-clamp-1">{addr.city} - {addr.state}</p>
                            <p className="font-lato text-[10px] text-[var(--azul-profundo)]/40 mt-1">{addr.zipCode}</p>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            setIsAddingNewAddress(true);
                        }}
                        className={`p-4 border border-dashed flex items-center justify-center gap-2 font-lato text-[10px] uppercase tracking-widest transition-all ${isAddingNewAddress ? 'border-[var(--dourado-suave)] text-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/20 text-[var(--azul-profundo)]/40 hover:border-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)]/60'}`}
                    >
                        + Novo Endereço
                    </button>
                </div>
            )}

            {isAddingNewAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                    <input
                        type="text" name="nome" required placeholder="Nome"
                        value={formData.nome} onChange={onChange}
                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                    />
                    <input
                        type="text" name="sobrenome" required placeholder="Sobrenome"
                        value={formData.sobrenome} onChange={onChange}
                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                    />
                    <input
                        type="text" name="endereco" required placeholder="Endereço e Número"
                        value={formData.endereco} onChange={onChange}
                        className="md:col-span-2 w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                    />
                    <input
                        type="text" name="cidade" required placeholder="Cidade"
                        value={formData.cidade} onChange={onChange}
                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <input
                            type="text" name="estado" required placeholder="UF"
                            value={formData.estado} onChange={onChange}
                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                        />
                        <input
                            type="text" name="cep" required placeholder="CEP"
                            value={formData.cep} onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').substring(0, 8);
                                onChange({ target: { name: 'cep', value: val } } as unknown as React.ChangeEvent<HTMLInputElement>);
                                if (val.length === 8) onCalculateShipping(val);
                            }}
                            className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                        />
                    </div>
                    {user?.id && (
                        <label className="md:col-span-2 flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.saveAddress}
                                onChange={(e) => onSetSaveAddress(e.target.checked)}
                                className="accent-[var(--azul-profundo)]"
                            />
                            <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60">Salvar este endereço para futuras compras</span>
                        </label>
                    )}
                </div>
            )}
        </section>
    );
};

export default CheckoutAddress;
