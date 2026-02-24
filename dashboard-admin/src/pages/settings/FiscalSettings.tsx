import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle2, Clock } from 'lucide-react';
import { FiscalIntegrationService } from '../../services/FiscalIntegrationService';
import type { FiscalIntegration } from '../../services/FiscalIntegrationService';
import { ConfigService } from '../../services/ConfigService';

export function FiscalSettings() {
    const [integrations, setIntegrations] = useState<FiscalIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [retentionDays, setRetentionDays] = useState(30);

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
            const [intData, configData] = await Promise.all([
                FiscalIntegrationService.getAll(),
                ConfigService.get('DOCUMENT_RETENTION_DAYS')
            ]);
            setIntegrations(intData);
            if (configData) setRetentionDays(parseInt(configData.configValue));
        } catch (error) {
            console.error('Erro ao carregar dados fiscais', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveIntegration = async (slug: string, apiKey: string, active: boolean) => {
        setSaving(true);
        try {
            await FiscalIntegrationService.save({
                providerName: slug,
                apiKey,
                active
            });
            alert('Configuração salva com sucesso!');
            loadData();
        } catch (error) {
            alert('Erro ao salvar configuração.');
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
        <div className="space-y-8 pb-20 max-w-5xl mx-auto">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                        <FileText className="text-white" size={28} />
                    </div>
                    Automação Fiscal e Logística
                </h1>
                <p className="text-gray-500 mt-1">Configure NFe automática e regras de retenção de documentos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROVIDERS.map(provider => {
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
                        <p className="text-sm text-gray-500">Documentos serão deletados automaticamente após este período.</p>
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
    );
}
