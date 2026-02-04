import { useEffect, useState } from 'react';
import { Truck, Save, AlertCircle } from 'lucide-react';
import { ShippingService } from '../../services/ShippingService';
import type { ShippingProvider } from '../../types/store-settings';

export function ShippingPage() {
    const [providers, setProviders] = useState<ShippingProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await ShippingService.getAll();
            setProviders(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar as configurações de frete. O serviço pode estar indisponível.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await ShippingService.toggle(id, !currentStatus);
            // Otimista: Atualiza localmente
            setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !currentStatus } : p));
        } catch (err) {
            alert('Erro ao atualizar status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Frete e Entrega</h1>
                    <p className="text-gray-500">Gerencie os métodos de envio da sua loja</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center p-8 text-gray-500">Carregando provedores...</div>
            ) : (
                <div className="grid gap-6">
                    {providers.length === 0 && !error && (
                        <div className="text-center p-8 text-gray-500 bg-white rounded-xl border">
                            Nenhum provedor de frete configurado no backend.
                        </div>
                    )}

                    {providers.map(provider => (
                        <div key={provider.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${provider.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">{provider.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">ID: {provider.id}</p>

                                    {/* Exemplo de Configs - Renderização dinâmica simples */}
                                    <div className="space-y-2 mt-3">
                                        {Object.entries(provider.config).map(([key, value]) => (
                                            <div key={key} className="flex flex-col">
                                                <span className="text-xs text-gray-500 uppercase">{key}</span>
                                                <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={provider.enabled}
                                        onChange={() => handleToggle(provider.id, provider.enabled)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {provider.enabled ? 'Ativo' : 'Inativo'}
                                    </span>
                                </label>
                                <button className="text-gray-400 hover:text-indigo-600 p-2">
                                    <Save size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
