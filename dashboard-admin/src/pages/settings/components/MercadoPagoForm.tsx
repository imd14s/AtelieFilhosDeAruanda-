import { useState } from 'react';
import { Shield, Globe, Webhook, Zap, CreditCard, User, Settings, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
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

    const [activeSection, setActiveSection] = useState<string | null>('id');

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
            {/* 1. Identification */}
            <SectionHeader id="id" icon={Globe} title="1. Identificação" desc="Dados gerais do conector" />
            {activeSection === 'id' && (
                <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 border-b">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">Nome do Conector</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={config.identification.name}
                            onChange={e => setConfig({ ...config, identification: { ...config.identification, name: e.target.value } })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">Moeda & Mercado</label>
                        <div className="flex gap-2">
                            <select
                                className="w-1/2 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={config.identification.currency}
                                onChange={e => setConfig({ ...config, identification: { ...config.identification, currency: e.target.value as any } })}
                            >
                                <option value="BRL">BRL (Real)</option>
                                <option value="USD">USD (Dólar)</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Mercado (ex: BR)"
                                className="w-1/2 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                value={config.identification.market}
                                onChange={e => setConfig({ ...config, identification: { ...config.identification, market: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Credentials */}
            <SectionHeader id="creds" icon={Shield} title="2. Credenciais" desc="Chaves de API para Produção" />
            {activeSection === 'creds' && (
                <div className="p-6 bg-white space-y-4 border-b">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">Access Token <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="APP_USR-..."
                            value={config.credentials.accessToken}
                            onChange={e => setConfig({ ...config, credentials: { ...config.credentials, accessToken: e.target.value } })}
                        />
                        <p className="text-[10px] text-gray-400">Usado pelo backend para processar pagamentos.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">Public Key <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="APP_USR-..."
                            value={config.credentials.publicKey}
                            onChange={e => setConfig({ ...config, credentials: { ...config.credentials, publicKey: e.target.value } })}
                        />
                        <p className="text-[10px] text-gray-400">Usada no frontend para tokenização segura.</p>
                    </div>
                </div>
            )}

            {/* 3. Webhooks */}
            <SectionHeader id="web" icon={Webhook} title="3. Webhooks" desc="Notificações em tempo real" />
            {activeSection === 'web' && (
                <div className="p-6 bg-white space-y-4 border-b">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">URL do Webhook</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={config.webhooks.url}
                            onChange={e => setConfig({ ...config, webhooks: { ...config.webhooks, url: e.target.value } })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600">Secret de Assinatura</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={config.webhooks.secret}
                            onChange={e => setConfig({ ...config, webhooks: { ...config.webhooks, secret: e.target.value } })}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={config.webhooks.validateSignature}
                            onChange={e => setConfig({ ...config, webhooks: { ...config.webhooks, validateSignature: e.target.checked } })}
                        />
                        <span className="text-sm text-gray-600">Ativar validação por assinatura</span>
                    </div>
                </div>
            )}

            {/* 4. Discovery & Methods */}
            <SectionHeader id="methods" icon={Zap} title="4. Métodos & Descoberta" desc="Configurações por meio de pagamento" />
            {activeSection === 'methods' && (
                <div className="p-6 bg-white space-y-6 border-b">
                    <button className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition">
                        <RefreshCw size={16} /> Sincronizar métodos disponíveis (API/v1)
                    </button>

                    {/* Cartão */}
                    <div className="border rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <CreditCard size={18} className="text-blue-500" />
                                <h5 className="font-bold text-gray-700">Cartão (Brick / Transparente)</h5>
                            </div>
                            <input
                                type="checkbox"
                                checked={config.methods.enabled.card.active}
                                onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, card: { ...config.methods.enabled.card, active: e.target.checked } } } })}
                            />
                        </div>
                        {config.methods.enabled.card.active && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Máx. Parcelas</label>
                                    <input type="number" className="w-full border p-1 rounded" value={config.methods.enabled.card.maxInstallments} onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, card: { ...config.methods.enabled.card, maxInstallments: Number(e.target.value) } } } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Sem juros até</label>
                                    <input type="number" className="w-full border p-1 rounded" value={config.methods.enabled.card.interestFree} onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, card: { ...config.methods.enabled.card, interestFree: Number(e.target.value) } } } })} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pix */}
                    <div className="border rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center gap-2">
                                <Zap size={18} className="text-green-500" />
                                <h5 className="font-bold text-gray-700">PIX (Nativo Mercado Pago)</h5>
                            </div>
                            <input
                                type="checkbox"
                                checked={config.methods.enabled.pix.active}
                                onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, pix: { ...config.methods.enabled.pix, active: e.target.checked } } } })}
                            />
                        </div>
                        {config.methods.enabled.pix.active && (
                            <div>
                                <label className="text-xs text-gray-500">Expiração (minutos)</label>
                                <input type="number" className="w-full border p-1 rounded" value={config.methods.enabled.pix.expirationMinutes} onChange={e => setConfig({ ...config, methods: { ...config.methods, enabled: { ...config.methods.enabled, pix: { ...config.methods.enabled.pix, expirationMinutes: Number(e.target.value) } } } })} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 5. Global Rules */}
            <SectionHeader id="config" icon={Settings} title="5. Regras Globais" desc="Idempotência e Comportamento" />
            {activeSection === 'config' && (
                <div className="p-6 bg-white space-y-4 border-b">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Idempotência habilitada</span>
                        <input
                            type="checkbox"
                            checked={config.globalRules.idempotency}
                            onChange={e => setConfig({ ...config, globalRules: { ...config.globalRules, idempotency: e.target.checked } })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">Estratégia</label>
                        <select className="w-full border p-2 rounded-lg" value={config.globalRules.strategy}>
                            <option value="uuid_per_attempt">uuid_per_attempt (Recomendado)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* 6. Payer Data */}
            <SectionHeader id="payer" icon={User} title="6. Dados do Pagador" desc="Campos exigidos no seu Checkout" />
            {activeSection === 'payer' && (
                <div className="p-6 bg-white space-y-4 border-b">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500">Documento (CPF/CNPJ)</label>
                        <select
                            className="w-full border p-2 rounded-lg"
                            value={config.payerData.document}
                            onChange={e => setConfig({ ...config, payerData: { ...config.payerData, document: e.target.value as any } })}
                        >
                            <option value="required">Obrigatório</option>
                            <option value="optional">Opcional</option>
                            <option value="none">Não solicitar</option>
                        </select>
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
