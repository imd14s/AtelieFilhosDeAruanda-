import { MaskedInput } from '../../ui/MaskedInput';

export interface IssuerData {
    cnpj: string;
    ie: string;
    name: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
}

interface IssuerDataFormProps {
    data: IssuerData;
    onChange: (field: keyof IssuerData, value: string) => void;
    disabled?: boolean;
}

export function IssuerDataForm({ data, onChange, disabled }: IssuerDataFormProps) {



    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Dados Cadastrais do Emitente</h3>
                <p className="text-sm text-gray-500 mb-6">Informações oficiais da empresa necessárias para assinatura digital e geração de NF-e.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Razão Social</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-medium text-sm disabled:opacity-50"
                            placeholder="Ateliê Filhos de Aruanda LTDA"
                        />
                    </div>

                    <div>
                        <MaskedInput
                            mask="cnpj"
                            label="CNPJ"
                            value={data.cnpj}
                            onChange={(val) => onChange('cnpj', val)}
                            disabled={disabled}
                            placeholder="00.000.000/0000-00"
                            className="bg-gray-50 border-gray-100 font-mono"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Inscrição Estadual (IE)</label>
                        <input
                            type="text"
                            value={data.ie}
                            onChange={(e) => onChange('ie', e.target.value.replace(/\D/g, ''))}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-mono text-sm disabled:opacity-50"
                            placeholder="Isento ou numérico"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Endereço Fiscal</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <MaskedInput
                            mask="cep"
                            label="CEP"
                            value={data.zip}
                            onChange={(val) => onChange('zip', val)}
                            disabled={disabled}
                            placeholder="00000-000"
                            className="bg-gray-50 border-gray-100 font-mono"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Logradouro (Rua, Avenida)</label>
                        <input
                            type="text"
                            value={data.street}
                            onChange={(e) => onChange('street', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm disabled:opacity-50"
                            placeholder="Rua das Flores"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Número</label>
                        <input
                            type="text"
                            value={data.number}
                            onChange={(e) => onChange('number', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm disabled:opacity-50"
                            placeholder="S/N"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Complemento</label>
                        <input
                            type="text"
                            value={data.complement}
                            onChange={(e) => onChange('complement', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm disabled:opacity-50"
                            placeholder="Apt 101, Galpão B"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Bairro</label>
                        <input
                            type="text"
                            value={data.neighborhood}
                            onChange={(e) => onChange('neighborhood', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm disabled:opacity-50"
                            placeholder="Centro"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Cidade</label>
                        <input
                            type="text"
                            value={data.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm disabled:opacity-50"
                            placeholder="São Paulo"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">UF</label>
                        <input
                            type="text"
                            value={data.state}
                            maxLength={2}
                            onChange={(e) => onChange('state', e.target.value.toUpperCase())}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-bold text-center text-sm disabled:opacity-50 uppercase"
                            placeholder="SP"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
