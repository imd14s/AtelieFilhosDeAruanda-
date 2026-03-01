import { MaskedInput } from '../ui/MaskedInput';

interface CheckoutContactProps {
    email: string;
    document: string;
    docType: 'cpf' | 'cnpj';
    onDocTypeChange: (type: 'cpf' | 'cnpj') => void;
    onDocumentChange: (val: string) => void;
    documentError?: string;
}

const CheckoutContact: React.FC<CheckoutContactProps> = ({
    email,
    document,
    docType,
    onDocTypeChange,
    onDocumentChange,
    documentError
}) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-white flex items-center justify-center font-playfair text-sm">1</span>
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Informações de Contato</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60 font-lato">E-mail da Conta</label>
                    <input
                        type="email" name="email" readOnly placeholder="seu@email.com"
                        value={email}
                        className="w-full border border-[var(--azul-profundo)]/5 bg-gray-50/50 px-6 py-4 font-lato text-sm outline-none cursor-not-allowed text-[var(--azul-profundo)]/40"
                    />
                    <p className="text-[9px] text-[var(--azul-profundo)]/30 font-lato italic">O pedido será vinculado a este e-mail verificado.</p>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between pb-1">
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]/60 font-lato">
                            {docType === 'cpf' ? 'CPF' : 'CNPJ'}
                        </label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="docType"
                                    checked={docType === 'cpf'}
                                    onChange={() => onDocTypeChange('cpf')}
                                    className="accent-[var(--azul-profundo)]"
                                />
                                <span className="text-[9px] uppercase tracking-widest text-[var(--azul-profundo)]/40 font-lato group-hover:text-[var(--azul-profundo)]">Pessoa Física</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="docType"
                                    checked={docType === 'cnpj'}
                                    onChange={() => onDocTypeChange('cnpj')}
                                    className="accent-[var(--azul-profundo)]"
                                />
                                <span className="text-[9px] uppercase tracking-widest text-[var(--azul-profundo)]/40 font-lato group-hover:text-[var(--azul-profundo)]">Pessoa Jurídica</span>
                            </label>
                        </div>
                    </div>
                    <MaskedInput
                        mask={docType === 'cpf' ? 'cpf' : 'cnpj'}
                        required
                        placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                        value={document}
                        onChange={onDocumentChange}
                        className={`w-full border ${documentError ? 'border-red-500 bg-red-50/10' : 'border-[var(--azul-profundo)]/10'} bg-white px-6 py-4 font-lato text-sm outline-none focus:border-[var(--dourado-suave)] transition-colors`}
                    />
                    {documentError && <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-1">{documentError}</p>}
                </div>
            </div>
        </section>
    );
};

export default CheckoutContact;
