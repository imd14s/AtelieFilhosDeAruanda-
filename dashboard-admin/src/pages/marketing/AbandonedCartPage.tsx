import { useEffect, useState } from 'react';
import { Mail, Clock, Save, Plus, Trash2, Zap, Settings2, BellRing, ArrowRight, X, PenTool, Info, Sparkles } from 'lucide-react';
import { MarketingService } from '../../services/MarketingService';
import { api } from '../../api/axios';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import type { AbandonedCartSettings } from '../../types/marketing';

export function AbandonedCartPage() {
    const [settings, setSettings] = useState<AbandonedCartSettings | null>(null);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estado do Modal de Edição de E-mail
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [editingTriggerIndex, setEditingTriggerIndex] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [settingsData, signaturesData] = await Promise.all([
                MarketingService.getAbandonedCartSettings(),
                api.get('/marketing/signatures').then(res => res.data)
            ]);
            setSettings(settingsData);
            setSignatures(signaturesData);
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
            alert('Motor de recuperação atualizado com sucesso! 🚀');
        } catch (err) {
            alert('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const addTrigger = () => {
        if (!settings) return;
        const newTriggers = [...(settings.triggers || [])];
        newTriggers.push({
            delayMinutes: 60,
            subject: 'Você esqueceu algo especial no seu carrinho! 🛍️',
            content: '<p>Olá! Notamos que você deixou alguns itens incríveis no seu carrinho.</p><p>Eles ainda estão reservados, mas por tempo limitado. Volte agora e finalize sua compra!</p>',
            signatureId: signatures.length > 0 ? signatures[0].id : ''
        });
        setSettings({ ...settings, triggers: newTriggers });
    };

    const removeTrigger = (index: number) => {
        if (!settings) return;
        const newTriggers = (settings.triggers || []).filter((_, i) => i !== index);
        setSettings({ ...settings, triggers: newTriggers });
    };

    const updateTrigger = (index: number, field: string, value: any) => {
        if (!settings) return;
        const newTriggers = [...(settings.triggers || [])];
        newTriggers[index] = { ...newTriggers[index], [field]: value };
        setSettings({ ...settings, triggers: newTriggers });
    };

    const openEmailEditor = (index: number) => {
        setEditingTriggerIndex(index);
        setIsEmailModalOpen(true);
    };

    // Auxiliar para converter delayMinutes em formato legível (Minutos, Horas, Dias)
    const getTimeLabel = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
        return `${Math.floor(minutes / 1440)} dias`;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium">Sincronizando motor de automação...</p>
        </div>
    );

    if (!settings) return <div className="p-8 text-center text-red-500">Erro ao carregar módulo de marketing.</div>;

    const triggers = settings.triggers || [];
    const currentTrigger = editingTriggerIndex !== null ? triggers[editingTriggerIndex] : null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header com Design Premium */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Motor de Recuperação</h1>
                        <p className="text-gray-500 mt-1 max-w-md">Otimize suas vendas convertendo carrinhos abandonados em pedidos finalizados de forma 100% automática.</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${settings.enabled ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {settings.enabled ? 'Ativo' : 'Pausado'}
                        </span>
                        <div
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${settings.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Gravando...' : 'Publicar Motor'}
                    </button>
                </div>
            </div>

            {/* Timeline de Automação */}
            <div className="relative space-y-12">
                {/* Linha da Timeline (Vertical) */}
                <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-100 via-indigo-100 to-transparent " />

                {triggers.map((trigger, index) => (
                    <div key={index} className="relative flex gap-10 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 100}ms` }}>

                        {/* Indicador de Ordem */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-indigo-50 shadow-md flex items-center justify-center z-10">
                            <span className="text-xl font-black text-indigo-600">{index + 1}</span>
                        </div>

                        {/* Card do Gatilho */}
                        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <BellRing size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Ação de Disparo</h3>
                                            <p className="text-sm text-gray-500 italic">E-mail de lembrete enviado ao cliente</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeTrigger(index)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                    {/* Configuração de Tempo */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                            <Clock size={16} className="text-indigo-500" />
                                            Quando enviar?
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                value={trigger.delayMinutes ?? 0}
                                                onChange={(e) => updateTrigger(index, 'delayMinutes', parseInt(e.target.value) || 1)}
                                                className="w-24 p-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:border-indigo-500 outline-none text-center"
                                            />
                                            <span className="text-sm text-gray-600 font-medium">minutos após o abandono</span>
                                            <div className="hidden lg:block ml-auto text-xs font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded">
                                                {getTimeLabel(trigger.delayMinutes ?? 0)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configuração de Conteúdo */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                            <Mail size={16} className="text-indigo-500" />
                                            Assunto do E-mail
                                        </label>
                                        <input
                                            value={trigger.subject ?? ''}
                                            onChange={(e) => updateTrigger(index, 'subject', e.target.value)}
                                            className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-300 focus:border-indigo-500 outline-none transition"
                                            placeholder="Ex: Seu carrinho está esperando por você!"
                                        />
                                        <p className="text-[10px] text-gray-400">Dica: Use emojis para aumentar a taxa de abertura!</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer do Card - Preview */}
                            <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Settings2 size={14} />
                                    <span>Integração com template de Carrinho Ativo</span>
                                </div>
                                <button
                                    onClick={() => openEmailEditor(index)}
                                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 cursor-pointer hover:underline bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm transition-all active:scale-95"
                                >
                                    <PenTool size={14} /> Configurar E-mail <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Botão de Adicionar Passo */}
                <div className="relative flex gap-10">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center z-10 border-dashed">
                        <Plus size={24} className="text-indigo-400" />
                    </div>
                    <button
                        onClick={addTrigger}
                        className="flex-1 max-w-sm py-8 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/10 transition group"
                    >
                        <Plus size={32} className="group-hover:scale-110 transition" />
                        <span className="font-bold">Adicionar novo lembrete</span>
                        <p className="text-[11px]">Crie uma sequência estratégica de disparos</p>
                    </button>
                </div>
            </div>

            {/* Dica Estratégica */}
            <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md">
                        <Sparkles size={40} className="text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Dica de Especialista: A Regra de Ouro</h2>
                        <p className="text-indigo-200 mt-1">Estatísticas mostram que o primeiro envio após <b>1 hora</b> tem 3x mais conversão. O segundo deve ser após 24h, oferecendo um pequeno desconto.</p>
                    </div>
                </div>
                {/* Decorativo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </div>

            {/* Modal de Edição de E-mail (Gmail Style) */}
            {isEmailModalOpen && currentTrigger && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Mail size={20} />
                                <h2 className="text-xl font-bold text-gray-800">Editor de Recuperação</h2>
                            </div>
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Assunto do E-mail</label>
                                    <input
                                        value={currentTrigger.subject || ''}
                                        onChange={(e) => updateTrigger(editingTriggerIndex!, 'subject', e.target.value)}
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Assunto cativante..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Assinatura</label>
                                    <select
                                        value={currentTrigger.signatureId || ''}
                                        onChange={(e) => updateTrigger(editingTriggerIndex!, 'signatureId', e.target.value)}
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="">Sem assinatura</option>
                                        {signatures.map(sig => (
                                            <option key={sig.id} value={sig.id}>{sig.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Corpo da Mensagem (Rich Text)</label>
                                <div className="border rounded-xl overflow-hidden">
                                    <RichTextEditor
                                        value={currentTrigger.content || ''}
                                        onChange={(content) => updateTrigger(editingTriggerIndex!, 'content', content)}
                                        placeholder="Escreva sua mensagem de recuperação aqui..."
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex items-start gap-3">
                                <Info size={18} className="text-yellow-600 mt-0.5" />
                                <p className="text-xs text-yellow-700 leading-relaxed">
                                    Dica: Os itens do carrinho do cliente serão listados automaticamente abaixo deste conteúdo. Use variáveis como <code className="bg-yellow-200 px-1 rounded">{"{{NOME_CLIENTE}}"}</code> para personalizar o envio.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95"
                            >
                                Aplicar Conteúdo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
