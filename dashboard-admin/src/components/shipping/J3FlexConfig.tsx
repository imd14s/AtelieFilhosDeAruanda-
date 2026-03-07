import { useState, useEffect } from 'react';
import { DollarSign, Clock, Info, Truck } from 'lucide-react';

interface J3FlexConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

export function J3FlexConfig({ config, onChange }: J3FlexConfigProps) {
    const [cost, setCost] = useState(config.cost || '');
    const [deliveryDays, setDeliveryDays] = useState(config.delivery_days || '3');
    const [displayName, setDisplayName] = useState(config.display_name || 'J3 Flex');

    useEffect(() => {
        onChange({
            cost: cost ? parseFloat(cost) : 0,
            delivery_days: deliveryDays ? parseInt(deliveryDays) : 3,
            display_name: displayName,
        });
    }, [cost, deliveryDays, displayName]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                    <Truck size={20} />
                    <h2>Configuração J3 Flex</h2>
                </div>
                <p className="text-sm text-gray-500">
                    Defina os valores padrão para as entregas via J3 Flex.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome de Exibição</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Ex: J3 Flex Express"
                        />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Valor Fixo (R$)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prazo de Entrega (Dias Úteis)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="number"
                                min="0"
                                value={deliveryDays}
                                onChange={(e) => setDeliveryDays(e.target.value)}
                                className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="3"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Info size={16} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700">
                        Este motor valida a elegibilidade de entrega baseado no arquivo <strong>J3Flex.csv</strong> carregado no servidor.
                    </p>
                </div>
            </section>
        </div>
    );
}
