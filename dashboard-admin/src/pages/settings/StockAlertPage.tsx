import { Save, Bell, AlertTriangle, Plus, Trash2, Info, ChevronRight } from 'lucide-react';
import { useStockAlerts, STOCK_COLORS, type ColorPreset } from '../../hooks/useStockAlerts';
import clsx from 'clsx';

export function StockAlertPage() {
    const {
        loading,
        saving,
        success,
        settings,
        lowStockProducts,
        updateThreshold,
        updateTemplate,
        addPriority,
        removePriority,
        updatePriority,
        saveSettings
    } = useStockAlerts();

    if (loading || !settings) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Carregando suas configurações...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header com Ações */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="text-indigo-600" size={24} />
                        Alertas de Estoque Inteligentes
                    </h1>
                    <p className="text-gray-500 mt-1">Configure avisos visuais automáticos para nunca ficar sem produtos.</p>
                </div>
                <div className="flex items-center gap-3">
                    {success && (
                        <span className="text-green-600 text-sm font-medium animate-in slide-in-from-right-4 duration-300">
                            ✓ Salvo com sucesso!
                        </span>
                    )}
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna de Configuração (Esquerda) */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Card: Regras Básicas */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Info size={18} className="text-indigo-500" />
                                Regras de Ativação
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Limite Geral de Alerta</label>
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                                        {settings.threshold} unidades
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={settings.threshold}
                                    onChange={e => updateThreshold(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    Produtos com estoque igual ou menor que este valor serão destacados no sistema.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Mensagem de Alerta (Template)</label>
                                <textarea
                                    value={settings.messageTemplate}
                                    onChange={e => updateTemplate(e.target.value)}
                                    rows={3}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm"
                                    placeholder="Ex: Atenção: O produto {product} está no fim!"
                                />
                                <div className="flex gap-2">
                                    <code className="text-[10px] bg-gray-100 p-1 rounded">{"{product}"} = Nome</code>
                                    <code className="text-[10px] bg-gray-100 p-1 rounded">{"{stock}"} = Qtd</code>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Card: Graus de Urgência */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-500" />
                                Níveis de Urgência (Cores)
                            </h2>
                            <button
                                onClick={addPriority}
                                className="text-sm text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition flex items-center gap-1"
                            >
                                <Plus size={16} /> Novo Nível
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {settings.priorities.length === 0 && (
                                <p className="text-center py-4 text-gray-400 text-sm">Adicione um nível para colorir seus alertas.</p>
                            )}
                            <div className="space-y-3">
                                {settings.priorities.map((p, idx) => (
                                    <div key={idx} className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 transition hover:bg-white hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/50">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        value={p.label}
                                                        placeholder="Ex: Crítico"
                                                        onChange={e => updatePriority(idx, 'label', e.target.value)}
                                                        className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none text-sm font-medium py-1"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Abaixo de</span>
                                                    <input
                                                        type="number"
                                                        value={p.maxLevel}
                                                        onChange={e => updatePriority(idx, 'maxLevel', parseInt(e.target.value))}
                                                        className="w-16 bg-white border rounded text-center text-sm font-bold py-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Escolha a Cor:</span>
                                                <div className="flex gap-2">
                                                    {(Object.keys(STOCK_COLORS) as ColorPreset[]).map(colorKey => (
                                                        <button
                                                            key={colorKey}
                                                            onClick={() => updatePriority(idx, 'color', colorKey)}
                                                            className={clsx(
                                                                "w-6 h-6 rounded-full transition-transform hover:scale-125",
                                                                STOCK_COLORS[colorKey].bg,
                                                                STOCK_COLORS[colorKey].border,
                                                                "border-2",
                                                                p.color === colorKey ? "scale-110 ring-2 ring-indigo-500 ring-offset-2" : "opacity-60"
                                                            )}
                                                            title={STOCK_COLORS[colorKey].label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removePriority(idx)}
                                            className="text-gray-300 hover:text-red-500 transition p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Coluna de Preview (Direita) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl shadow-indigo-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Visualização em Tempo Real</h3>
                            <p className="text-indigo-200 text-xs mb-4">Veja como seus produtos aparecerão no dashboard.</p>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {lowStockProducts.length === 0 ? (
                                    <div className="bg-white/10 p-6 rounded-xl border border-white/5 text-center">
                                        <p className="text-sm">Parabéns! Nenhum produto em risco crítico.</p>
                                    </div>
                                ) : (
                                    lowStockProducts.map(p => {
                                        const preset = p.currentPriority ? STOCK_COLORS[p.currentPriority.color as ColorPreset] : null;
                                        return (
                                            <div key={p.id} className="bg-white p-4 rounded-xl flex items-center justify-between group cursor-default">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-gray-900 font-semibold text-sm truncate">{p.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 font-medium">Qtd: {p.stock}</span>
                                                        {preset && (
                                                            <>
                                                                <ChevronRight size={10} className="text-gray-300" />
                                                                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-black uppercase", preset.bg, preset.text)}>
                                                                    {p.currentPriority?.label}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={clsx(
                                                    "w-3 h-3 rounded-full animate-pulse shadow-sm",
                                                    preset?.bg || "bg-gray-200"
                                                )} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        {/* Efeito de fundo */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                            <Info size={16} className="text-indigo-500" />
                            Como as cores funcionam?
                        </h4>
                        <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                            <li>O sistema sempre usa o nível de estoque para decidir a cor.</li>
                            <li>Se um produto tem 3 unidades, e um nível diz "Abaixo de 5", ele usará essa cor.</li>
                            <li>Se houver múltiplos níveis compatíveis, o menor valor prevalece.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
