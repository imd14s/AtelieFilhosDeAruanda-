import { useState, useEffect } from 'react';
import { Shield, MapPin, Truck, Plus, Trash2, Info } from 'lucide-react';

interface MelhorEnvioConfigData {
    token?: string;
    zipCode?: string;
    allowedCarriers?: string[];
    rules?: Record<string, string>;
}

interface MelhorEnvioConfigProps {
    config: MelhorEnvioConfigData;
    onChange: (newConfig: MelhorEnvioConfigData) => void;
}

const CARRIER_CATALOG = [
    { id: 'PAC', name: 'Correios PAC' },
    { id: 'SEDEX', name: 'Correios SEDEX' },
    { id: 'Jadlog .Package', name: 'Jadlog .Package' },
    { id: 'Jadlog .Com', name: 'Jadlog .Com' },
    { id: 'Azul Cargo', name: 'Azul Cargo' },
    { id: 'Latam Cargo', name: 'Latam Cargo' },
    { id: 'Loggi', name: 'Loggi' }
];

const UF_LIST = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export function MelhorEnvioConfig({ config, onChange }: MelhorEnvioConfigProps) {
    const [token, setToken] = useState(config.token || '');
    const [zipCode, setZipCode] = useState(config.zipCode || '');
    const [allowedCarriers, setAllowedCarriers] = useState<string[]>(config.allowedCarriers || []);
    const [rules, setRules] = useState<{ id: string; name: string; state: string; minAmount: string; }[]>(parseRules(config.rules || {}));

    function parseRules(rulesObj: Record<string, string>) {
        return Object.entries(rulesObj).map(([name, spel]: [string, string]) => {
            // Regex simples para extrair UF e Valor de: region == 'SP' and total >= 200
            const stateMatch = spel.match(/region\s*==\s*'([^']*)'/);
            const totalMatch = spel.match(/total\s*>=\s*([\d.]+)/);
            const minAmount = totalMatch ? totalMatch[1] : '';
            return {
                id: Math.random().toString(36).substr(2, 9),
                name,
                state: stateMatch ? (stateMatch[1] || 'TODOS') : 'TODOS',
                minAmount: (minAmount === '0' ? '' : minAmount) || ''
            };
        });
    }

    function generateSpel(rule: { id: string; name: string; state: string; minAmount: string; }) {
        const parts = [];
        if (rule.state !== 'TODOS') parts.push(`region == '${rule.state}'`);
        const amount = parseFloat(rule.minAmount || '0');
        if (amount > 0) parts.push(`total >= ${amount}`);
        return parts.length > 0 ? parts.join(' and ') : 'true';
    }

    useEffect(() => {
        const rulesObj: Record<string, string> = {};
        rules.forEach(r => {
            rulesObj[r.name] = generateSpel(r);
        });

        onChange({
            token,
            zipCode,
            allowedCarriers,
            rules: rulesObj
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, zipCode, allowedCarriers, rules]);

    const handleCarrierToggle = (id: string) => {
        setAllowedCarriers(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const addRule = () => {
        setRules(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: `Regra ${prev.length + 1}`,
            state: 'TODOS',
            minAmount: ''
        }]);
    };

    const removeRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const updateRule = (id: string, field: string, value: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Credenciais */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                    <Shield size={20} />
                    <h2>Credenciais e Origem</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Token de API</label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Insira seu Token do Melhor Envio"
                        />
                    </div>
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
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Transportadoras */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                    <Truck size={20} />
                    <h2>Transportadoras Ativas</h2>
                </div>
                <p className="text-sm text-gray-500">Selecione quais serviços do Melhor Envio você deseja oferecer no checkout.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {CARRIER_CATALOG.map(carrier => (
                        <button
                            key={carrier.id}
                            onClick={() => handleCarrierToggle(carrier.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all font-medium text-sm ${allowedCarriers.includes(carrier.id)
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                                }`}
                        >
                            {carrier.name}
                            {allowedCarriers.includes(carrier.id) && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />}
                        </button>
                    ))}
                </div>
            </section>

            {/* Regras de Frete Grátis */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                        <Plus size={20} />
                        <h2>Regras de Frete Grátis</h2>
                    </div>
                    <button
                        onClick={addRule}
                        className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-100 transition flex items-center gap-2"
                    >
                        Nova Regra
                    </button>
                </div>

                <div className="space-y-3">
                    {rules.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Info className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-sm text-gray-400 font-medium">Nenhuma regra de frete grátis configurada.</p>
                        </div>
                    )}

                    {rules.map(rule => (
                        <div key={rule.id} className="grid md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-end animate-in slide-in-from-left duration-300">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Nome da Regra</label>
                                <input
                                    type="text"
                                    value={rule.name}
                                    onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                                    className="w-full border p-2 rounded-lg text-sm bg-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Estado (UF)</label>
                                <select
                                    value={rule.state}
                                    onChange={(e) => updateRule(rule.id, 'state', e.target.value)}
                                    className="w-full border p-2 rounded-lg text-sm bg-white"
                                >
                                    <option value="TODOS">Todos os Estados</option>
                                    {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Valor Mínimo (R$)</label>
                                <input
                                    type="number"
                                    value={rule.minAmount === '0' || rule.minAmount === '' ? '' : rule.minAmount}
                                    placeholder="0.00"
                                    onChange={(e) => updateRule(rule.id, 'minAmount', e.target.value)}
                                    className="w-full border p-2 rounded-lg text-sm bg-white"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => removeRule(rule.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
