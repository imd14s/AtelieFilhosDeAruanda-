import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle2, Clock, Building2, Server } from 'lucide-react';
import { FiscalIntegrationService } from '../../services/FiscalIntegrationService';
import type { FiscalIntegration } from '../../services/FiscalIntegrationService';
import { ConfigService } from '../../services/ConfigService';
import { IssuerDataForm, type IssuerData } from '../../components/settings/fiscal/IssuerDataForm';
import { EmissionConfigForm, type EmissionConfigData } from '../../components/settings/fiscal/EmissionConfigForm';

type Tab = 'EMITENTE' | 'INTEGRACOES';

export function FiscalSettings() {
    const [activeTab, setActiveTab] = useState<Tab>('EMITENTE');

    // Tab: Integrações
    const [integrations, setIntegrations] = useState<FiscalIntegration[]>([]);
    const [retentionDays, setRetentionDays] = useState(30);

    // Tab: Emitente
    const [issuerData, setIssuerData] = useState<IssuerData>({
        cnpj: '', ie: '', name: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: ''
    });
    const [emissionConfig, setEmissionConfig] = useState<EmissionConfigData>({
        taxRegime: '', environment: 'HOMOLOGACAO', invoiceSeries: '1', invoiceNumber: '0'
    });

    // Estado global de loading/saving
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const PROVIDERS = [
        { name: 'Bling', slug: 'bling' },
        { name: 'Tiny', slug: 'tiny' },
        { name: 'eNotas', slug: 'enotas' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [intData, configs] = await Promise.all([
                FiscalIntegrationService.getAll(),
                ConfigService.getAll()
            ]);

            setIntegrations(intData);

            // Map Configs to state
            const getConfig = (key: string, fallback: string = '') => {
                return configs.find(c => c.configKey === key)?.configValue || fallback;
            };

            setRetentionDays(parseInt(getConfig('DOCUMENT_RETENTION_DAYS', '30')));

            setIssuerData({
                cnpj: getConfig('FISCAL_ISSUER_CNPJ'),
                ie: getConfig('FISCAL_ISSUER_IE'),
                name: getConfig('FISCAL_ISSUER_NAME'),
                street: getConfig('FISCAL_ADDRESS_STREET'),
                number: getConfig('FISCAL_ADDRESS_NUMBER'),
                complement: getConfig('FISCAL_ADDRESS_COMPLEMENT'),
                neighborhood: getConfig('FISCAL_ADDRESS_NEIGHBORHOOD'),
                city: getConfig('FISCAL_ADDRESS_CITY'),
                state: getConfig('FISCAL_ADDRESS_STATE'),
                zip: getConfig('FISCAL_ADDRESS_ZIP')
            });

            setEmissionConfig({
                taxRegime: getConfig('FISCAL_TAX_REGIME', ''),
                environment: getConfig('FISCAL_ENVIRONMENT', 'HOMOLOGACAO'),
                invoiceSeries: getConfig('FISCAL_INVOICE_SERIES', '1'),
                invoiceNumber: getConfig('FISCAL_INVOICE_NUMBER', '0')
            });

        } catch (error) {
            console.error('Erro ao carregar dados fiscais', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveIssuerConfig = async () => {
        // Validação Mínima
        if (!issuerData.cnpj || !issuerData.name || !emissionConfig.taxRegime) {
            alert('Por favor, preencha a Razão Social, CNPJ e Regime Tributário.');
            return;
        }

        setSaving(true);
        try {
            const payloads = [
                { configKey: 'FISCAL_ISSUER_CNPJ', configValue: issuerData.cnpj },
                { configKey: 'FISCAL_ISSUER_IE', configValue: issuerData.ie },
                { configKey: 'FISCAL_ISSUER_NAME', configValue: issuerData.name },
                { configKey: 'FISCAL_ADDRESS_STREET', configValue: issuerData.street },
                { configKey: 'FISCAL_ADDRESS_NUMBER', configValue: issuerData.number },
                { configKey: 'FISCAL_ADDRESS_COMPLEMENT', configValue: issuerData.complement },
                { configKey: 'FISCAL_ADDRESS_NEIGHBORHOOD', configValue: issuerData.neighborhood },
                { configKey: 'FISCAL_ADDRESS_CITY', configValue: issuerData.city },
                { configKey: 'FISCAL_ADDRESS_STATE', configValue: issuerData.state },
                { configKey: 'FISCAL_ADDRESS_ZIP', configValue: issuerData.zip },

                { configKey: 'FISCAL_TAX_REGIME', configValue: emissionConfig.taxRegime },
                { configKey: 'FISCAL_ENVIRONMENT', configValue: emissionConfig.environment },
                { configKey: 'FISCAL_INVOICE_SERIES', configValue: emissionConfig.invoiceSeries },
                { configKey: 'FISCAL_INVOICE_NUMBER', configValue: emissionConfig.invoiceNumber },
            ];

            await Promise.all(payloads.map(p => ConfigService.upsert(p)));
            alert('Configurações de Emitente salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar config', error);
            alert('Ocorreu um erro ao persistir as configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveIntegration = async (slug: string, apiKey: string, active: boolean) => {
        setSaving(true);
        try {
            await FiscalIntegrationService.save({ providerName: slug, apiKey, active });
            alert('Integração salva com sucesso!');
            loadData();
        } catch (error) {
            alert('Erro ao salvar integração.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRetention = async () => {
        setSaving(true);
        try {
            await ConfigService.upsert({ configKey: 'DOCUMENT_RETENTION_DAYS', configValue: retentionDays.toString() });
            alert('Política de retenção atualizada!');
        } catch (error) {
            alert('Erro ao salvar retenção.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;

    return (
        <div className="space-y-6 pb-20 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                        <FileText className="text-white" size={28} />
                    </div>
                    Configurações Fiscais
                </h1>
                <p className="text-gray-500 mt-1">Gerencie os dados do Emitente (Sefaz) e integrações com painéis ERP.</p>
            </header>

            {/* TABBED NAVIGATION */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('EMITENTE')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'EMITENTE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Building2 size={18} /> Dados do Emitente (NFe)
                </button>
                <button
                    onClick={() => setActiveTab('INTEGRACOES')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'INTEGRACOES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Server size={18} /> Integrações e ERPs externos
                </button>
            </div>

            {/* TAB CONTENT: EMITENTE */}
            {activeTab === 'EMITENTE' && (
                <div className="space-y-6 animate-fadeIn">
                    <IssuerDataForm
                        data={issuerData}
                        onChange={(field, value) => setIssuerData(prev => ({ ...prev, [field]: value }))}
                        disabled={saving}
                    />

                    <EmissionConfigForm
                        data={emissionConfig}
                        onChange={(field, value) => setEmissionConfig(prev => ({ ...prev, [field]: value }))}
                        disabled={saving}
                    />

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSaveIssuerConfig}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
                        >
                            <Save size={18} />
                            {saving ? 'Processando...' : 'Salvar e Validar Identidade'}
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: INTEGRACOES */}
            {activeTab === 'INTEGRACOES' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.isArray(integrations) && PROVIDERS.map(provider => {
                            const config = integrations.find(i => i.providerName === provider.slug);
                            return (
                                <div key={provider.slug} className={`p-6 bg-white rounded-3xl border-2 transition-all ${config?.active ? 'border-blue-600 shadow-xl' : 'border-gray-100 shadow-sm'}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl">{provider.name}</h3>
                                        {config?.active && <CheckCircle2 className="text-green-500" size={20} />}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">API Key / Token</label>
                                            <input
                                                type="password"
                                                disabled={saving}
                                                defaultValue={config?.apiKey || ''}
                                                onBlur={(e) => handleSaveIntegration(provider.slug, e.target.value, config?.active || false)}
                                                placeholder="Ex: d829...z91"
                                                className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-mono text-sm disabled:opacity-50"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSaveIntegration(provider.slug, config?.apiKey || '', !config?.active)}
                                            disabled={saving}
                                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${config?.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            {saving ? 'Processando...' : (config?.active ? 'Desativar' : 'Ativar Provedor')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Política de Retenção (Cloudinary)</h2>
                                <p className="text-sm text-gray-500">Documentos fiscais anexos serão deletados automaticamente após este período.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-700">{retentionDays} dias</span>
                                    <span className="text-xs text-gray-400">Máximo: 90 dias</span>
                                </div>
                                <input
                                    type="range"
                                    min="30" max="90" step="30"
                                    disabled={saving}
                                    value={retentionDays}
                                    onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                                />
                            </div>
                            <button
                                onClick={handleSaveRetention}
                                disabled={saving}
                                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {saving ? 'Salvando...' : 'Salvar Política'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
