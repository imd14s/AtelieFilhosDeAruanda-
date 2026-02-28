import { MaskedInput } from '../ui/MaskedInput';

interface CheckoutContactProps {
    email: string;
    document: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDocumentChange: (val: string) => void;
}

const CheckoutContact: React.FC<CheckoutContactProps> = ({ email, document, onChange, onDocumentChange }) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">1</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Informações de Contato</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60 font-lato">E-mail para acompanhamento</label>
                    <input
                        type="email" name="email" required placeholder="seu@email.com"
                        value={email} onChange={onChange}
                        className="w-full border border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60 font-lato">CPF ou CNPJ (para Nota Fiscal)</label>
                    <MaskedInput
                        mask="cpf-cnpj"
                        required
                        placeholder="000.000.000-00"
                        value={document}
                        onChange={onDocumentChange}
                        className="border-[var(--azul-profundo)]/10 bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)]"
                    />
                </div>
            </div>
        </section>
    );
};

export default CheckoutContact;
