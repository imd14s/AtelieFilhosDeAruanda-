import { useState, useEffect } from 'react';
import { Shield, MapPin, Package, Clock, DollarSign, Info } from 'lucide-react';

interface MandaBemConfigData {
    apiKey?: string;
    apiSecret?: string;
    zipCode?: string;
    defaultWeight?: string | number;
    estimatedDays?: string | number;
    freeShippingMinAmount?: string | number;
    sandbox?: boolean;
}

interface MandaBemConfigProps {
    config: MandaBemConfigData;
    onChange: (newConfig: MandaBemConfigData) => void;
}

export function MandaBemConfig({ config, onChange }: MandaBemConfigProps) {
    const [apiKey, setApiKey] = useState(config.apiKey || '');
    const [apiSecret, setApiSecret] = useState(config.apiSecret || '');
    const [zipCode, setZipCode] = useState(config.zipCode || '');
    const [defaultWeight, setDefaultWeight] = useState(config.defaultWeight || '');
    const [estimatedDays, setEstimatedDays] = useState(config.estimatedDays || '');
    const [freeShippingMinAmount, setFreeShippingMinAmount] = useState(config.freeShippingMinAmount || '');
    const [sandbox, setSandbox] = useState(config.sandbox ?? true);

    useEffect(() => {
        onChange({
            apiKey,
            apiSecret,
            zipCode,
            defaultWeight: defaultWeight ? parseFloat(defaultWeight) : undefined,
            estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined,
            freeShippingMinAmount: freeShippingMinAmount ? parseFloat(freeShippingMinAmount) : undefined,
            sandbox,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey, apiSecret, zipCode, defaultWeight, estimatedDays, freeShippingMinAmount, sandbox]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Credenciais */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                    <Shield size={20} />
                    <h2>Credenciais da API</h2>
                </div>
                <p className="text-sm text-gray-500">
                    Insira as credenciais fornecidas pelo Manda Bem para conectar sua loja.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chave da API (API Key)</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Insira sua chave de API"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Segredo da API (API Secret)</label>
                        <input
                            type="password"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Insira seu segredo de API"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <Info size={16} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">
                        Você encontra suas credenciais no painel do Manda Bem em <strong>Configurações → Integrações</strong>.
                    </p>
                </div>
            </section>

            {/* Origem e Entrega */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                    <MapPin size={20} />
                    <h2>Origem e Entrega</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CEP de Origem</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="00000-000"
                                maxLength={9}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Peso Padrão (kg)</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={defaultWeight}
                                onChange={(e) => setDefaultWeight(e.target.value)}
                                className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="0.5"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prazo Extra (dias)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="number"
                                min="0"
                                value={estimatedDays}
                                onChange={(e) => setEstimatedDays(e.target.value)}
                                className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Frete Grátis e Ambiente */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-green-600 font-bold mb-2">
                    <DollarSign size={20} />
                    <h2>Frete Grátis e Ambiente</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Frete Grátis acima de (R$)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={freeShippingMinAmount}
                                onChange={(e) => setFreeShippingMinAmount(e.target.value)}
                                className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Deixe vazio para desativar"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Pedidos acima deste valor terão frete grátis. Deixe vazio para não oferecer.
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Ambiente
                        </label>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mandabem-env"
                                    checked={sandbox}
                                    onChange={() => setSandbox(true)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Teste (Sandbox)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="mandabem-env"
                                    checked={!sandbox}
                                    onChange={() => setSandbox(false)}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Produção</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Use "Teste" para simular cotações sem custo real.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
