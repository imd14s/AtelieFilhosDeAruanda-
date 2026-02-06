import { useEffect, useState } from 'react';
import { Truck, AlertCircle, Plus, LayoutGrid, ShieldCheck, Trash2, X, Code, Save } from 'lucide-react';
import { AdminProviderService } from '../../services/AdminProviderService';
import type { AdminServiceProvider } from '../../types/store-settings';

export function ShippingPage() {
    const [providers, setProviders] = useState<AdminServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProvider, setEditingProvider] = useState<AdminServiceProvider | null>(null);
    const [configJson, setConfigJson] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: '', code: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await AdminProviderService.listProviders();
            setProviders(data.filter(p => p.serviceType === 'SHIPPING'));
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Serviço de frete indisponível. Verifique os logs do backend.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await AdminProviderService.toggleProvider(id, !currentStatus);
            setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !currentStatus } : p));
        } catch (err) {
            alert('Erro ao atualizar status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este provedor de frete? Todas as configurações serão perdidas.')) return;
        try {
            await AdminProviderService.deleteProvider(id);
            setProviders(prev => prev.filter(p => p.id !== id));
            if (editingProvider?.id === id) setEditingProvider(null);
        } catch (err) {
            alert('Erro ao remover provedor.');
        }
    };

    const handleAddProvider = async () => {
        if (!newProvider.name || !newProvider.code) return;
        try {
            await AdminProviderService.createProvider({
                ...newProvider,
                serviceType: 'SHIPPING',
                enabled: false,
                priority: 0,
                healthEnabled: true
            });
            setIsAddModalOpen(false);
            setNewProvider({ name: '', code: '' });
            loadData();
        } catch (err) {
            alert('Erro ao criar provedor.');
        }
    };

    const handleOpenConfig = async (provider: AdminServiceProvider) => {
        if (editingProvider?.id === provider.id) {
            setEditingProvider(null);
            return;
        }
        const config = await AdminProviderService.getProviderConfig(provider.id);
        setEditingProvider(provider);
        setConfigJson(config ? config.configJson : '{}');
    };

    const handleSaveConfig = async () => {
        if (!editingProvider) return;
        try {
            await AdminProviderService.saveProviderConfig({
                providerId: editingProvider.id,
                configJson: configJson,
                environment: 'PRODUCTION'
            });
            alert('Configuração de frete salva!');
            setEditingProvider(null);
        } catch (err) {
            alert('Erro ao salvar configuração.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                        <Truck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Frete e Entrega</h1>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span className="text-sm">Configuração Dinâmica Ativa</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg active:scale-95"
                >
                    <Plus size={20} /> Adicionar Provedor
                </button>
            </header>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl flex items-center gap-4">
                    <AlertCircle size={32} />
                    <div>
                        <p className="font-bold">Erro de Sistema</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium">Carregando serviços de logística...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {providers.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                            <LayoutGrid size={48} className="text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">Nenhum serviço de frete</h3>
                            <p className="text-gray-500 max-w-xs mt-2">Adicione transportadoras ou serviços de entrega para começar.</p>
                        </div>
                    )}

                    {providers.map(provider => (
                        <div key={provider.id} className={`bg-white rounded-3xl border-2 transition-all ${editingProvider?.id === provider.id ? 'border-indigo-500 shadow-2xl ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${provider.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-300'}`}>
                                        <Truck size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-gray-800">{provider.name}</h3>
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{provider.code}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1 font-medium">Logística: <span className="font-mono">{provider.id}</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end mr-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={provider.enabled}
                                                onChange={() => handleToggle(provider.id, provider.enabled)}
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${provider.enabled ? 'text-indigo-600' : 'text-gray-400'}`}>
                                            {provider.enabled ? 'Operacional' : 'Inativo'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleOpenConfig(provider)}
                                        className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${editingProvider?.id === provider.id ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                    >
                                        <Code size={18} /> {editingProvider?.id === provider.id ? 'Fechar' : 'Configurar'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(provider.id)}
                                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                        title="Remover Provedor"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>

                            {editingProvider?.id === provider.id && (
                                <div className="p-8 pt-0 animate-slide-down space-y-4">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 tracking-widest">
                                            <Code size={14} /> Payload de Configuração (JSONB)
                                        </label>
                                        <textarea
                                            value={configJson}
                                            onChange={(e) => setConfigJson(e.target.value)}
                                            className="w-full h-48 p-4 font-mono text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
                                            placeholder='{ "apiKey": "...", "token": "..." }'
                                        />
                                        <div className="flex justify-end pt-2">
                                            <button
                                                onClick={handleSaveConfig}
                                                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-100 transition active:scale-95"
                                            >
                                                <Save size={18} /> Salvar Alterações
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Adicionar Provedor */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Novo Provedor de Frete</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Nome Transportadora</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Melhor Envio"
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newProvider.name}
                                    onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Código de Serviço</label>
                                <input
                                    type="text"
                                    placeholder="Ex: MELHOR_ENVIO"
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                                    value={newProvider.code}
                                    onChange={e => setNewProvider({ ...newProvider, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:text-gray-800 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddProvider}
                                disabled={!newProvider.name || !newProvider.code}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition active:scale-95"
                            >
                                Criar Provedor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
