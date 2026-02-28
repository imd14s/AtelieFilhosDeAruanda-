import React from 'react';
import { MaskedInput } from '../ui/MaskedInput';

interface CheckoutFiscalProps {
    document: string;
    onDocumentChange: (val: string) => void;
}

const CheckoutFiscal: React.FC<CheckoutFiscalProps> = ({ document, onDocumentChange }) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">2</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Identificação Fiscal</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <MaskedInput
                    mask="cpf-cnpj"
                    required
                    label="CPF ou CNPJ (para Nota Fiscal)"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    value={document}
                    onChange={onDocumentChange}
                    className="border-[var(--azul-profundo)]/10"
                />
                <p className="font-lato text-[10px] text-[var(--azul-profundo)]/40 uppercase tracking-widest leading-relaxed">
                    Necessário para a emissão da Nota Fiscal Eletrônica (NF-e).
                </p>
            </div>
        </section>
    );
};

export default CheckoutFiscal;
