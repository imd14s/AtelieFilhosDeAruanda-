import React from 'react';
import { Address } from '../../types';
import { useAuth } from '../../context/AuthContext';


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
                <div role="radiogroup" aria-label="Selecione um endereço de entrega" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {addresses.map(addr => {
                        const isSelected = selectedAddressId === addr.id && !isAddingNewAddress;
                        return (
                            <label
                                key={addr.id}
                                className={`relative flex flex-col p-5 border cursor-pointer transition-all duration-200 group focus-within:ring-2 focus-within:ring-[var(--dourado-suave)] focus-within:border-transparent ${isSelected ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5 shadow-sm' : 'border-[var(--azul-profundo)]/10 bg-white hover:border-[var(--dourado-suave)]/50 hover:shadow-sm hover:-translate-y-0.5'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border flex-shrink-0 transition-colors ${isSelected ? 'border-[var(--dourado-suave)]' : 'border-[var(--azul-profundo)]/30 group-hover:border-[var(--dourado-suave)]'}`}>
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--dourado-suave)]" />}
                                        </div>
                                        <span className="font-lato text-xs font-bold uppercase tracking-widest text-[var(--azul-profundo)]">
                                            {addr.street}, {addr.number}
                                        </span>
                                    </div>
                                </div>

                                <input
                                    type="radio"
                                    name="selectedAddress"
                                    value={addr.id}
                                    checked={isSelected}
                                    onChange={() => onSelectAddress(addr)}
                                    className="sr-only"
                                    aria-label={`Selecionar endereço ${addr.street}, ${addr.number}`}
                                />

                                <div className="pl-8 flex flex-col gap-1">
                                    <p className="font-lato text-sm text-[var(--azul-profundo)]/80 line-clamp-1">
                                        {addr.city} - {addr.state}
                                    </p>
                                    <p className="font-lato text-xs text-[var(--azul-profundo)]/50 tracking-wide font-medium">
                                        CEP: {addr.zipCode}
                                    </p>
                                </div>
                            </label>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        aria-pressed={isAddingNewAddress}
                        className={`flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--dourado-suave)] focus:border-transparent ${isAddingNewAddress ? 'border-[var(--dourado-suave)] text-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-[var(--azul-profundo)]/20 text-[var(--azul-profundo)]/60 hover:border-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)]/80 hover:bg-[var(--azul-profundo)]/5'}`}
                    >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isAddingNewAddress ? 'bg-[var(--dourado-suave)]/20 text-[var(--dourado-suave)]' : 'bg-[var(--azul-profundo)]/10 text-[var(--azul-profundo)]/60'}`}>
                            <span className="text-lg leading-none">+</span>
                        </div>
                        <span className="font-lato text-xs uppercase font-bold tracking-widest">
                            Novo Endereço
                        </span>
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
