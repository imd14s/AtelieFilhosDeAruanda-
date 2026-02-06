import { useEffect, useState } from 'react';
import { CreditCard, AlertCircle, Plus, LayoutGrid, ShieldCheck, Trash2, X } from 'lucide-react';
import { AdminProviderService } from '../../services/AdminProviderService';
import { MercadoPagoForm } from './components/MercadoPagoForm';
import type { AdminServiceProvider, MercadoPagoConfig } from '../../types/store-settings';

export function PaymentPage() {
    const [providers, setProviders] = useState<AdminServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProvider, setEditingProvider] = useState<AdminServiceProvider | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: '', code: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await AdminProviderService.listProviders();
            // Filtrar o PIX isolado conforme metodologia: ele deve ser um método dentro de outro provedor
            setProviders(data.filter(p => p.serviceType === 'PAYMENT' && p.code !== 'PIX'));
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Serviço de pagamento indisponível. Verifique os logs do backend.');
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
        if (!confirm('Tem certeza que deseja remover este provedor? Todas as configurações serão perdidas.')) return;
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
                serviceType: 'PAYMENT',
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

    const handleSaveConfig = async (config: MercadoPagoConfig) => {
        if (!editingProvider) return;
        try {
            await AdminProviderService.saveProviderConfig({
                providerId: editingProvider.id,
                configJson: JSON.stringify(config),
                environment: 'PRODUCTION'
            });
            alert('Configuração salva com sucesso!');
            setEditingProvider(null);
            loadData();
        } catch (err) {
            alert('Erro ao salvar configuração profissional.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pagamentos</h1>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span className="text-sm">Ambiente Seguro (SSL/JWT Ativo)</span>
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
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl flex items-center gap-4 animate-shake">
                    <AlertCircle size={32} />
                    <div>
                        <p className="font-bold">Erro de Conexão</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-medium">Sincronizando gateways...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {providers.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                            <LayoutGrid size={48} className="text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">Nenhum gateway configurado</h3>
                            <p className="text-gray-500 max-w-xs mt-2">Você ainda não possui conectores de pagamento ativos no backend.</p>
                        </div>
                    )}

                    {providers.map(provider => (
                        <div key={provider.id} className={`bg-white rounded-3xl border-2 transition-all ${editingProvider?.id === provider.id ? 'border-blue-500 shadow-2xl ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${provider.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-300'}`}>
                                        <CreditCard size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-gray-800">{provider.name}</h3>
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{provider.code}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1 font-medium">ID de Integração: <span className="font-mono">{provider.id}</span></p>
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
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                        <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${provider.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                            {provider.enabled ? 'Operacional' : 'Desativado'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setEditingProvider(editingProvider?.id === provider.id ? null : provider)}
                                        className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${editingProvider?.id === provider.id ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        {editingProvider?.id === provider.id ? 'Fechar Editor' : 'Configurar'}
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
                                <div className="p-8 pt-0 animate-slide-down">
                                    {provider.code === 'MERCADO_PAGO' ? (
                                        <MercadoPagoForm
                                            initialConfig={JSON.parse(localStorage.getItem(`mp-config-${provider.id}`) || '{}')}
                                            onSave={(config) => {
                                                localStorage.setItem(`mp-config-${provider.id}`, JSON.stringify(config));
                                                handleSaveConfig(config);
                                            }}
                                            onCancel={() => setEditingProvider(null)}
                                        />
                                    ) : (
                                        <div className="p-12 text-center text-gray-400 border-2 border-dashed rounded-3xl">
                                            Configuração avançada disponível apenas para Mercado Pago nesta versão.
                                        </div>
                                    )}
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
                            <h3 className="text-xl font-bold text-gray-800">Novo Provedor de Pagamento</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Nome Amigável</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Mercado Pago - Principal"
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newProvider.name}
                                    onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Código (Slug)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: MERCADO_PAGO"
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                    value={newProvider.code}
                                    onChange={e => setNewProvider({ ...newProvider, code: e.target.value.toUpperCase() })}
                                />
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Deve corresponder ao driver no backend</p>
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
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition active:scale-95"
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
