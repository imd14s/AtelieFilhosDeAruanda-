import { useState } from 'react';
import { Shield, Zap, CreditCard, Settings, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';
import type { MercadoPagoConfig } from '../../../types/store-settings';

interface Props {
    initialConfig: Partial<MercadoPagoConfig>;
    onSave: (config: MercadoPagoConfig) => void;
    onCancel: () => void;
}

export function MercadoPagoForm({ initialConfig, onSave, onCancel }: Props) {
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

    const toggleSection = (id: string) => setActiveSection(activeSection === id ? null : id);

    const SectionHeader = ({ id, icon: Icon, title, desc }: { id: string, icon: any, title: string, desc: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 border-b transition-all first:rounded-t-xl"
        >
            <div className="flex gap-4 items-center">
                <div className={`p-2 rounded-lg ${activeSection === id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-800">{title}</h4>
                    <p className="text-xs text-gray-500">{desc}</p>
                </div>
            </div>
            {activeSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
    );

    return (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* 1. Credenciais - O mais importante */}
            <SectionHeader id="creds" icon={Shield} title="1. Chaves de Integração" desc="Insira suas credenciais do Mercado Pago" />
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
                        <label className="text-sm font-bold text-gray-700">Access Token (Chave Secreta)</label>
                        <input
                            type="password"
                            className="w-full border p-3 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="APP_USR-..."
                            value={config.credentials.accessToken}
                            onChange={e => setConfig({ ...config, credentials: { ...config.credentials, accessToken: e.target.value } })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Public Key (Chave Pública)</label>
                        <input
                            type="text"
                            className="w-full border p-3 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="APP_USR-..."
                            value={config.credentials.publicKey}
                            onChange={e => setConfig({ ...config, credentials: { ...config.credentials, publicKey: e.target.value } })}
                        />
                    </div>
                </div>
            )}

            {/* 2. Métodos de Pagamento */}
            <SectionHeader id="methods" icon={Zap} title="2. O que aceitar na loja?" desc="Ative ou desative as opções de pagamento" />
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
            <SectionHeader id="advanced" icon={Settings} title="3. Configurações Técnicas" desc="Webhooks e Identificação (Opcional)" />
            {activeSection === 'advanced' && (
                <div className="p-6 bg-white space-y-6 border-b">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Nome Amigável</label>
                            <input type="text" className="w-full border p-2 rounded-lg text-sm" value={config.identification.name} onChange={e => setConfig({ ...config, identification: { ...config.identification, name: e.target.value } })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">URL de Notificação (Webhook)</label>
                            <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="https://..." value={config.webhooks.url} onChange={e => setConfig({ ...config, webhooks: { ...config.webhooks, url: e.target.value } })} />
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
