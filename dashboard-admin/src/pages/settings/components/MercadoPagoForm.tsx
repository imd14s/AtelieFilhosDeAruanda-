import { useState } from 'react';
import { Shield, Zap, CreditCard, Settings, ChevronDown, ChevronUp, AlertCircle, Check, Copy } from 'lucide-react';
import type { MercadoPagoConfig } from '../../../types/store-settings';

interface Props {
    initialConfig: Partial<MercadoPagoConfig>;
    isProviderEnabled?: boolean;
    onSave: (config: MercadoPagoConfig) => void;
    onCancel: () => void;
}

const SectionHeader = ({ id, icon: Icon, title, desc, isActive, onToggle }: { id: string, icon: React.ElementType, title: string, desc: string, isActive: boolean, onToggle: (id: string) => void }) => (
    <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 border-b transition-all first:rounded-t-xl"
    >
        <div className="flex gap-4 items-center">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                <Icon size={20} />
            </div>
            <div className="text-left">
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </div>
        {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
);

export function MercadoPagoForm({ initialConfig, isProviderEnabled = true, onSave, onCancel }: Props) {
    const [config, setConfig] = useState<MercadoPagoConfig>({
        identification: {
            name: initialConfig.identification?.name || 'Mercado Pago Principal',
            active: initialConfig.identification?.active ?? true,
            currency: initialConfig.identification?.currency || 'BRL',
            market: initialConfig.identification?.market || 'BR',
        },
        credentials: {
            accessToken: initialConfig.credentials?.accessToken || '',
            publicKey: initialConfig.credentials?.publicKey || '',
        },
        webhooks: {
            url: initialConfig.webhooks?.url || '',
            secret: initialConfig.webhooks?.secret || '',
            events: initialConfig.webhooks?.events || ['payment.created', 'payment.updated'],
            validateSignature: initialConfig.webhooks?.validateSignature ?? true,
        },
        methods: {
            discovered: initialConfig.methods?.discovered || [],
            enabled: {
                card: {
                    active: initialConfig.methods?.enabled?.card?.active ?? false,
                    maxInstallments: initialConfig.methods?.enabled?.card?.maxInstallments || 12,
                    interestFree: initialConfig.methods?.enabled?.card?.interestFree || 3,
                    autoCapture: initialConfig.methods?.enabled?.card?.autoCapture ?? true,
                    binaryMode: initialConfig.methods?.enabled?.card?.binaryMode ?? false,
                    descriptor: initialConfig.methods?.enabled?.card?.descriptor || '',
                },
                pix: {
                    active: initialConfig.methods?.enabled?.pix?.active ?? false,
                    expirationMinutes: initialConfig.methods?.enabled?.pix?.expirationMinutes || 30,
                    instructions: initialConfig.methods?.enabled?.pix?.instructions || '',
                },
                boleto: {
                    active: initialConfig.methods?.enabled?.boleto?.active ?? false,
                    daysToExpiration: initialConfig.methods?.enabled?.boleto?.daysToExpiration || 3,
                    instructions: initialConfig.methods?.enabled?.boleto?.instructions || '',
                },
            }
        },
        globalRules: {
            idempotency: initialConfig.globalRules?.idempotency ?? true,
            strategy: 'uuid_per_attempt',
            timeout: initialConfig.globalRules?.timeout || 30,
        },
        payerData: {
            name: initialConfig.payerData?.name || 'required',
            document: initialConfig.payerData?.document || 'required',
        }
    });

    const [activeSection, setActiveSection] = useState<string | null>('creds');
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (!config.webhooks.url) return;
        navigator.clipboard.writeText(config.webhooks.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleSection = (id: string) => setActiveSection(activeSection === id ? null : id);

    const isPublicKeyValid = (key: string) => !key || key.startsWith('APP_USR-') || key.startsWith('TEST-');
    const isAccessTokenValid = (key: string) => !key || key.startsWith('APP_USR-') || key.startsWith('TEST-');

    return (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {!isProviderEnabled && (
                <div className="bg-amber-50 border-b border-amber-200 p-4 flex gap-3 items-center animate-pulse">
                    <AlertCircle size={24} className="text-amber-600 shrink-0" />
                    <div className="text-amber-800 text-sm font-medium">
                        <strong>Aviso:</strong> Este provedor está **desativado** na listagem principal.
                        Mesmo salvando as chaves, ele não aparecerá no checkout até ser ativado.
                    </div>
                </div>
            )}
            {/* 1. Credenciais - O mais importante */}
            <SectionHeader id="creds" icon={Shield} title="1. Chaves de Integração" desc="Insira suas credenciais do Mercado Pago" isActive={activeSection === 'creds'} onToggle={toggleSection} />
            {activeSection === 'creds' && (
                <div className="p-6 bg-white space-y-4 border-b">
                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start border border-blue-100">
                        <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Você encontra estas chaves no seu **Painel do Mercado Pago** em
                            Configurações {' > '} Credenciais de Produção.
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Public Key (Chave Pública)</label>
                        <input
                            type="text"
                            className={`w-full border p-3 rounded-xl font-mono focus:ring-2 outline-none transition-colors ${!isPublicKeyValid(config.credentials.publicKey)
                                    ? 'border-red-500 bg-red-50 focus:ring-red-200'
                                    : 'focus:ring-blue-500'
                                }`}
                            placeholder="APP_USR-..."
                            value={config.credentials.publicKey}
                            onChange={e => setConfig({ ...config, credentials: { ...config.credentials, publicKey: e.target.value.trim() } })}
                        />
                        {!isPublicKeyValid(config.credentials.publicKey) && (
                            <p className="text-[10px] text-red-500 font-bold">Formato inválido. Deve começar com APP_USR- ou TEST-.</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Access Token (Chave Secreta)</label>
                        <input
                            type="password"
                            className={`w-full border p-3 rounded-xl font-mono focus:ring-2 outline-none transition-colors ${!isAccessTokenValid(config.credentials.accessToken)
                                    ? 'border-red-500 bg-red-50 focus:ring-red-200'
                                    : 'focus:ring-blue-500'
                                }`}
                            placeholder="APP_USR-..."
                            value={config.credentials.accessToken}
                            onChange={e => setConfig({ ...config, credentials: { ...config.credentials, accessToken: e.target.value.trim() } })}
                        />
                        {!isAccessTokenValid(config.credentials.accessToken) && (
                            <p className="text-[10px] text-red-500 font-bold">Formato inválido. Deve começar com APP_USR- ou TEST-.</p>
                        )}
                    </div>
                </div>
            )}

            {/* 2. Métodos de Pagamento */}
            <SectionHeader id="methods" icon={Zap} title="2. O que aceitar na loja?" desc="Ative ou desative as opções de pagamento" isActive={activeSection === 'methods'} onToggle={toggleSection} />
            {activeSection === 'methods' && (
                <div className="p-6 bg-white space-y-6 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pix */}
                        <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${config.methods.enabled.pix.active ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'}`}
                            onClick={() => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, pix: { ...config.methods.enabled.pix, active: !config.methods.enabled.pix.active } } } })}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-500 italic font-black">PIX</div>
                                    <span className="font-bold text-gray-800">Aceitar PIX</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${config.methods.enabled.pix.active ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                    {config.methods.enabled.pix.active && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500">Liberação instantânea do pedido após o pagamento.</p>
                            {config.methods.enabled.pix.active && (
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <label className="text-[10px] font-bold text-green-700 uppercase block mb-1">Desconto PIX (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            className="w-20 border border-green-300 p-2 rounded-lg text-sm bg-white"
                                            value={config.methods.enabled.pix.discountPercent === 0 ? '' : config.methods.enabled.pix.discountPercent}
                                            placeholder="0.00"
                                            onChange={e => {
                                                e.stopPropagation();
                                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, pix: { ...config.methods.enabled.pix, discountPercent: val } } } });
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <span className="text-xs text-green-600 font-bold">% OFF</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cartão */}
                        <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${config.methods.enabled.card.active ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}
                            onClick={() => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, card: { ...config.methods.enabled.card, active: !config.methods.enabled.card.active } } } })}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                        <CreditCard size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800">Aceitar Cartão</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${config.methods.enabled.card.active ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                    {config.methods.enabled.card.active && <Check size={14} className="text-white" />}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500">Parcelamento em até {config.methods.enabled.card.maxInstallments}x.</p>
                        </div>
                    </div>

                    {config.methods.enabled.card.active && (
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3 border">
                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Configurações de Parcelamento</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Máx. Parcelas</label>
                                    <select className="w-full border p-2 rounded-lg" value={config.methods.enabled.card.maxInstallments} onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, card: { ...config.methods.enabled.card, maxInstallments: Number(e.target.value) } } } })}>
                                        {[1, 2, 3, 4, 5, 6, 10, 12].map(n => <option key={n} value={n}>{n}x</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Sem juros até</label>
                                    <select className="w-full border p-2 rounded-lg" value={config.methods.enabled.card.interestFree} onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, card: { ...config.methods.enabled.card, interestFree: Number(e.target.value) } } } })}>
                                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3. Configurações Avançadas (Escondidas por padrão) */}
            <SectionHeader id="advanced" icon={Settings} title="3. Configurações Técnicas" desc="Webhooks e Identificação (Opcional)" isActive={activeSection === 'advanced'} onToggle={toggleSection} />
            {activeSection === 'advanced' && (
                <div className="p-6 bg-white space-y-6 border-b">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Nome Amigável</label>
                            <input type="text" className="w-full border p-2 rounded-lg text-sm" value={config.identification.name} onChange={e => setConfig({ ...config, identification: { ...config.identification, name: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">API Host (Domínio do Backend)</label>
                            <div className="flex bg-gray-50 border rounded-lg overflow-hidden group focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                <input
                                    type="text"
                                    className="w-full bg-transparent p-2 text-sm text-gray-700 font-mono outline-none"
                                    placeholder="https://api.seudominio.com.br"
                                    value={config.webhooks.url.replace('/api/webhooks/mercadopago', '')}
                                    onChange={e => {
                                        let base = e.target.value.trim();
                                        // Remove trailing slashes and common duplicate paths for real-time preview
                                        base = base.replace(/\/+$/, '').replace(/\/api$/, '');
                                        const final = base ? `${base}/api/webhooks/mercadopago`.replace(/\/+/g, '/').replace(':/', '://') : '';
                                        setConfig({ ...config, webhooks: { ...config.webhooks, url: final } });
                                    }}
                                />
                                <button
                                    onClick={handleCopy}
                                    type="button"
                                    title="Copiar URL Final"
                                    className="px-4 py-2 hover:bg-gray-200 text-gray-600 transition flex items-center justify-center border-l bg-white"
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-[10px] text-gray-400 font-mono truncate">Final: {config.webhooks.url || 'Aguardando host...'}</span>
                                <span className="text-[10px] text-blue-500">Insira apenas o domínio. O caminho /api/webhooks/mercadopago será adicionado automaticamente.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-6 bg-gray-50 flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 text-gray-500 hover:text-gray-800 font-semibold"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => onSave(config)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-md transform active:scale-95 transition"
                >
                    Salvar Mudanças
                </button>
            </div>
        </div>
    );
}
