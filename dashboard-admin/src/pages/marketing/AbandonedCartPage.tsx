import { useEffect, useState } from 'react';
import { Mail, Clock } from 'lucide-react';
import { MarketingService } from '../../services/MarketingService';
import type { AbandonedCartSettings } from '../../types/marketing';

export function AbandonedCartPage() {
    const [settings, setSettings] = useState<AbandonedCartSettings | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;
    if (!settings) return <div className="p-8 text-center text-red-500">Erro ao carregar módulo.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Recuperação de Carrinho</h1>
                    <p className="text-gray-500">Email automático para clientes que não finalizaram a compra</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Módulo Ativo</span>
                    <input type="checkbox" checked={settings.enabled} readOnly className="toggle" />
                </div>
            </div>

            <div className="grid gap-6">
                {settings.triggers.map((trigger, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Envio #{index + 1}</h3>
                                <p className="text-sm text-gray-500">
                                    Disparar após {trigger.delayMinutes} minutos de inatividade
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Assunto do Email</label>
                                <div className="flex gap-2 items-center mt-1">
                                    <Mail size={16} className="text-gray-400" />
                                    <input
                                        value={trigger.subject}
                                        className="flex-1 p-2 border rounded text-sm bg-gray-50"
                                        readOnly // Readonly por enquanto (Mock)
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
