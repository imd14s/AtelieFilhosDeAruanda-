import { useEffect, useState } from 'react';
import { Mail, Clock, Save } from 'lucide-react';
import { MarketingService } from '../../services/MarketingService';
import type { AbandonedCartSettings } from '../../types/marketing';

export function AbandonedCartPage() {
    const [settings, setSettings] = useState<AbandonedCartSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await MarketingService.getAbandonedCartSettings();
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        try {
            setSaving(true);
            await MarketingService.updateAbandonedCartSettings(settings);
            alert('Configurações salvas com sucesso!');
        } catch (err) {
            alert('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const updateTrigger = (index: number, field: string, value: any) => {
        if (!settings) return;
        const newTriggers = [...(settings.triggers || [])];
        newTriggers[index] = { ...newTriggers[index], [field]: value };
        setSettings({ ...settings, triggers: newTriggers });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;
    if (!settings || !settings.triggers) return <div className="p-8 text-center text-red-500">Erro ao carregar módulo ou dados incompletos.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Recuperação de Carrinho</h1>
                    <p className="text-gray-500">Email automático para clientes que não finalizaram a compra</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Módulo Ativo</span>
                        <input
                            type="checkbox"
                            checked={settings?.enabled ?? false}
                            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                            className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-indigo-600 relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5"
                        />
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
            </div>

            <div className="grid gap-6">
                {Array.isArray(settings.triggers) && settings.triggers.length > 0 ? (
                    settings.triggers.map((trigger, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Envio #{index + 1}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500 text-nowrap">Disparar após</span>
                                        <input
                                            type="number"
                                            value={trigger.delayMinutes ?? 0}
                                            onChange={(e) => updateTrigger(index, 'delayMinutes', parseInt(e.target.value) || 0)}
                                            className="w-20 p-1 border rounded text-sm text-center"
                                        />
                                        <span className="text-sm text-gray-500 text-nowrap">minutos de inatividade</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Assunto do Email</label>
                                    <div className="flex gap-2 items-center mt-1">
                                        <Mail size={16} className="text-gray-400" />
                                        <input
                                            value={trigger.subject ?? ''}
                                            onChange={(e) => updateTrigger(index, 'subject', e.target.value)}
                                            className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Ex: Você esqueceu algo em seu carrinho!"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        Nenhum gatilho configurado.
                    </div>
                )}
            </div>
        </div>
    );
}
