import React from 'react';

interface CheckoutContactProps {
    email: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckoutContact: React.FC<CheckoutContactProps> = ({ email, onChange }) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">1</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Informações de Contato</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <input
                    type="email" name="email" required placeholder="E-mail para acompanhamento"
                    value={email} onChange={onChange}
                    className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                />
            </div>
        </section>
    );
};

export default CheckoutContact;
