import { useState, useEffect } from 'react';
import { ChannelIntegrationService } from '../../services/ChannelIntegrationService';
import { Store, Settings, Save, ExternalLink, CheckCircle2, XCircle, AlertCircle, Plus, X } from 'lucide-react';

interface MarketplaceStatus {
    provider: string;
    active: boolean;
    configured: boolean;
    updatedAt?: string;
}

interface ServiceProvider {
    id: string;
    name: string;
    code: string;
    serviceType: string;
    driverKey: string;
    active: boolean; // if the driver itself is enabled in the system
}

export function IntegrationsPage() {
    const [statuses, setStatuses] = useState<Record<string, MarketplaceStatus>>({});
    const [loading, setLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [appId, setAppId] = useState('');
    const [appSecret, setAppSecret] = useState('');
    const [saving, setSaving] = useState(false);

    // New state for available providers
    const [availableProviders, setAvailableProviders] = useState<ServiceProvider[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [syncing, setSyncing] = useState<Record<string, boolean>>({});

    // Hardcoded icons/metadata for display purposes (could be moved to backend or config)
    const providerMetadata: Record<string, { icon: string }> = {
        'mercadolivre': { icon: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.21.3/mercadolibre/favicon.svg' },
        'tiktok': { icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg' }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch available drivers from backend
            const providers = await ChannelIntegrationService.getAvailableProviders();
            setAvailableProviders(providers);

            // 2. Fetch status for each provider
            // We only care about MARKETPLACE type providers
            const marketplaceProviders = providers.filter((p: ServiceProvider) => p.serviceType === 'MARKETPLACE');

            const results = await Promise.all(marketplaceProviders.map((m: ServiceProvider) => ChannelIntegrationService.getStatus(m.code)));
            const newStatuses: Record<string, MarketplaceStatus> = {};
            results.forEach(status => {
                newStatuses[status.provider] = status;
            });
            setStatuses(newStatuses);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigure = (providerCode: string) => {
        setIsConfigModalOpen(true);
        setSelectedProvider(providerCode);
        setAppId('');
        setAppSecret('');
    };

    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    const handleTestConnection = async () => {
        if (!selectedProvider || !appId || !appSecret) {
            alert('Preencha App ID e App Secret para testar.');
            return;
        }
        setTestingConnection(true);
        try {
            await ChannelIntegrationService.testConnection(selectedProvider, { appId, appSecret });
            alert('Conexão testada com sucesso!');
        } catch (error) {
            alert('Falha ao testar conexão. Verifique as credenciais.');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSaveAndAuth = async () => {
        if (!selectedProvider) return;
        setSaving(true);
        try {
            // 1. Salvar Credenciais
            await ChannelIntegrationService.saveCredentials(selectedProvider, { appId, appSecret });

            // 2. Obter URL de Autenticação
            const redirectUri = `${window.location.protocol}//${window.location.host}/api/integrations/${selectedProvider}/callback?redirectUri=${encodeURIComponent(window.location.href)}`;
            const { url } = await ChannelIntegrationService.getAuthUrl(selectedProvider, encodeURIComponent(redirectUri));

            // 3. Redirecionar para OAuth
            window.location.href = url;
        } catch (error) {
            alert('Erro ao configurar integração. Verifique as credenciais.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddChannel = (providerCode: string) => {
        // In this simplified flow, adding a channel just opens the configuration for it
        // The backend status check will determine if it's "connected" or not
        handleConfigure(providerCode);
        setIsAddModalOpen(false);
    };

    const handleSync = async (providerCode: string) => {
        setSyncing(prev => ({ ...prev, [providerCode]: true }));
        try {
            const { count } = await ChannelIntegrationService.syncProducts(providerCode);
            alert(`${count} produtos sincronizados com sucesso!`);
            // Could re-load data here if sync affects status
        } catch (error) {
            console.error('Failed to sync products', error);
            alert('Falha ao sincronizar produtos. Verifique se a integração está ativa.');
        } finally {
            setSyncing(prev => ({ ...prev, [providerCode]: false }));
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Carregando canais de venda...</p>
            </div>
        </div>
    );

    // Filter providers to show only those involved in our filtered view or all configured + available
    // For now, let's just show all MARKETPLACE providers returned by the backend
    const marketplaceProviders = availableProviders.filter(p => p.serviceType === 'MARKETPLACE');

    return (
        <div className="space-y-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                            <Store className="text-white" size={28} />
                        </div>
                        Canais de Venda
                    </h1>
                    <p className="text-gray-500 mt-1 text-lg">Conecte sua loja aos maiores marketplaces do mercado.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Adicionar Canal
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {marketplaceProviders.map(provider => {
                    const status = statuses[provider.code];
                    // Only show if it's configured or active? Or show all?
                    // Request says: "adiciona nas configuração a opção de adicionar Canais de Venda"
                    // implies we might only show active ones here, but for now let's show all

                    const icon = providerMetadata[provider.code]?.icon || 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png'; // Default icon

                    return (
                        <div key={provider.id} className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                    <img src={icon} alt={provider.name} className="w-10 h-10 object-contain" />
                                </div>
                                {status?.active ? (
                                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1.5">
                                        <CheckCircle2 size={14} /> CONECTADO
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs font-bold rounded-full border border-gray-100 flex items-center gap-1.5">
                                        <XCircle size={14} /> DESCONECTADO
                                    </span>
                                )}
                            </div>

                            <h3 className="font-extrabold text-2xl text-gray-900 mb-2">{provider.name}</h3>
                            <p className="text-gray-500 mb-8 flex-grow leading-relaxed">
                                Sincronize produtos, estoque e pedidos automaticamente com o {provider.name}.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleConfigure(provider.code)}
                                    className="w-full py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-700 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Settings size={18} /> {status?.configured ? 'Reconfigurar' : 'Configurar Canal'}
                                </button>
                                {status?.configured && !status.active && (
                                    <button
                                        onClick={() => handleSaveAndAuth()}
                                        className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={18} /> Autenticar Conta
                                    </button>
                                )}
                                {status?.active && (
                                    <button
                                        onClick={() => handleSync(provider.code)}
                                        disabled={syncing[provider.code]}
                                        className="w-full py-3.5 bg-green-600 text-white rounded-2xl text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {syncing[provider.code] ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <CheckCircle2 size={18} />
                                        )}
                                        Sincronizar Produtos
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Empty State / Add Placeholder if no providers */}
                {marketplaceProviders.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        Nenhum canal de venda disponível para configuração.
                    </div>
                )}
            </div>

            {/* Modal de Adicionar Canal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-extrabold text-2xl text-gray-900">Adicionar Canal de Venda</h3>
                                <p className="text-sm text-gray-500">Escolha uma integração para configurar</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-600 text-2xl">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {marketplaceProviders.map(provider => (
                                    <button
                                        key={provider.id}
                                        onClick={() => handleAddChannel(provider.code)}
                                        className="group p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                            <img
                                                src={providerMetadata[provider.code]?.icon || 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png'}
                                                alt={provider.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-700">{provider.name}</h4>
                                            <p className="text-xs text-gray-500">Marketplace</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Configuração (Existente) */}
            {isConfigModalOpen && selectedProvider && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <img
                                        src={providerMetadata[selectedProvider]?.icon}
                                        className="w-8 h-8 object-contain"
                                        alt="Marketplace"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-2xl text-gray-900">{availableProviders.find(p => p.code === selectedProvider)?.name}</h3>
                                    <p className="text-sm text-gray-500">Configuração de Credenciais</p>
                                </div>
                            </div>
                            <button onClick={() => setIsConfigModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="bg-indigo-50 p-5 rounded-2xl text-sm text-indigo-700 leading-relaxed border border-indigo-100/50">
                                <p className="font-bold mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} /> Próximos Passos:
                                </p>
                                <ol className="list-decimal list-inside space-y-2 opacity-90">
                                    <li>Obtenha as chaves no Portal do Desenvolvedor.</li>
                                    <li>Preencha os campos abaixo com as credenciais.</li>
                                    <li>Autorize o acesso clicando em salvar.</li>
                                </ol>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">App ID / Client ID</label>
                                    <input
                                        type="text"
                                        value={appId}
                                        onChange={e => setAppId(e.target.value)}
                                        placeholder="Ex: 582910382910"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">App Secret / Client Secret</label>
                                    <input
                                        type="password"
                                        value={appSecret}
                                        onChange={e => setAppSecret(e.target.value)}
                                        placeholder="••••••••••••••••••••••"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t bg-gray-50/50 flex flex-col gap-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testingConnection || !appId || !appSecret}
                                    className="flex-1 py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {testingConnection ? 'Testando...' : 'Testar Conexão'}
                                </button>
                                <button
                                    onClick={handleSaveAndAuth}
                                    disabled={saving || !appId || !appSecret}
                                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sincronizando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={22} />
                                            SALVAR E AUTENTICAR
                                        </>
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={() => setIsConfigModalOpen(false)}
                                className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
                            >
                                CONCELAR CONFIGURAÇÃO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
