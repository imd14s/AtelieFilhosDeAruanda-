import { useState, useEffect } from 'react';
import { Save, Bell, AlertTriangle, Plus, Trash2, Info } from 'lucide-react';
import { StockAlertService } from '../../services/StockAlertService';
import type { StockAlertSettings, StockPriority } from '../../services/StockAlertService';
import { ProductService } from '../../services/ProductService';
import type { Product } from '../../types/product';
import clsx from 'clsx';

export function StockAlertPage() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<StockAlertSettings | null>(null);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [alertSettings, allProducts] = await Promise.all([
                StockAlertService.getSettings(),
                ProductService.getAll()
            ]);
            setSettings(alertSettings);
            setProducts(allProducts);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        setSaving(true);
        setSuccess(false);
        try {
            await StockAlertService.saveSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar alertas:', error);
            alert('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const addPriority = () => {
        if (!settings) return;
        const newPriority: StockPriority = { label: 'Nova Faixa', maxLevel: 5, color: 'text-gray-600 bg-gray-100' };
        setSettings({ ...settings, priorities: [...settings.priorities, newPriority] });
    };

    const removePriority = (index: number) => {
        if (!settings) return;
        const newPriorities = settings.priorities.filter((_, i) => i !== index);
        setSettings({ ...settings, priorities: newPriorities });
    };

    const updatePriority = (index: number, field: keyof StockPriority, value: any) => {
        if (!settings) return;
        const newPriorities = [...settings.priorities];
        newPriorities[index] = { ...newPriorities[index], [field]: value };
        setSettings({ ...settings, priorities: newPriorities });
    };

    if (loading || !settings) {
        return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;
    }

    // Filtrar e classificar produtos por prioridade
    const lowStockProducts = products
        .filter(p => (p.stock || 0) <= settings.threshold + 10) // Mostrar próximos ao limite também
        .map(p => {
            const stock = p.stock || 0;
            // Encontrar a prioridade correspondente (menor maxLevel primeiro)
            const priority = [...settings.priorities]
                .sort((a, b) => a.maxLevel - b.maxLevel)
                .find(pr => stock <= pr.maxLevel);

            return { ...p, priority };
        })
        .sort((a, b) => (a.stock || 0) - (b.stock || 0));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configuração de Alerta de Estoque</h1>
                    <p className="mt-1 text-sm text-gray-500">Defina os gatilhos e acompanhe produtos com baixo estoque.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>Configurações salvas com sucesso!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configurações Globais */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                            <Bell className="text-indigo-600" size={20} />
                            Gatilhos Globais
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Alerta (Threshold)</label>
                                <input
                                    type="number"
                                    value={settings.threshold}
                                    onChange={e => setSettings({ ...settings, threshold: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ex: 10"
                                />
                                <p className="text-xs text-gray-500 mt-1">Estoque abaixo deste valor ativará avisos visuais.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template da Mensagem</label>
                            <textarea
                                value={settings.messageTemplate}
                                onChange={e => setSettings({ ...settings, messageTemplate: e.target.value })}
                                rows={3}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ex: Alerta: {product} está com apenas {stock} no estoque."
                            />
                            <p className="text-xs text-gray-500 mt-1">Variáveis: {'{product}'}, {'{stock}'}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={20} />
                                Níveis de Prioridade
                            </h2>
                            <button
                                onClick={addPriority}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                            >
                                <Plus size={16} /> Add Faixa
                            </button>
                        </div>

                        <div className="space-y-3">
                            {settings.priorities.map((p, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Rótulo</label>
                                        <input
                                            value={p.label}
                                            onChange={e => updatePriority(idx, 'label', e.target.value)}
                                            className="w-full text-sm p-1 border rounded"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Até (Qtd)</label>
                                        <input
                                            type="number"
                                            value={p.maxLevel}
                                            onChange={e => updatePriority(idx, 'maxLevel', parseInt(e.target.value))}
                                            className="w-full text-sm p-1 border rounded"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Cor (CSS Classes)</label>
                                        <input
                                            value={p.color}
                                            onChange={e => updatePriority(idx, 'color', e.target.value)}
                                            className="w-full text-sm p-1 border rounded font-mono"
                                        />
                                    </div>
                                    <button onClick={() => removePriority(idx)} className="text-red-400 hover:text-red-500 mt-4">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Painel de Riscos */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                        <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                            <Info className="text-indigo-600" size={20} />
                            Produtos em Risco
                        </h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-center text-gray-500 py-8 text-sm">Nenhum produto em nível crítico no momento.</p>
                            ) : (
                                lowStockProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-indigo-200 transition">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate" title={p.title}>{p.title}</p>
                                            <p className="text-xs text-gray-500">Estoque: {p.stock} un</p>
                                        </div>
                                        {p.priority && (
                                            <span className={clsx("px-2 py-1 rounded-full text-[10px] font-bold uppercase ml-2 flex-shrink-0", p.priority.color)}>
                                                {p.priority.label}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
