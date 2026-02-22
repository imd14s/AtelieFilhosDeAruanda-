import { useState, useEffect } from 'react';
import { Mail, Save, Clock, PenTool, Edit2, CheckCircle } from 'lucide-react';
import { api } from '../../api/axios';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import clsx from 'clsx';

interface EmailTemplate {
    id: string;
    slug: string;
    name: string;
    subject: string;
    content: string;
    signatureId: string | null;
    active: boolean;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [templatesRes, signaturesRes] = await Promise.all([
                api.get('/marketing/email-templates'),
                api.get('/marketing/signatures')
            ]);
            setTemplates(templatesRes.data);
            setSignatures(signaturesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate({ ...template });
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        setIsSaving(true);
        try {
            await api.put(`/marketing/email-templates/${editingTemplate.id}`, editingTemplate);
            setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
            setEditingTemplate(null);
            // Feedback opicional: alert ou toast
        } catch (error) {
            console.error('Error saving template:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mensagens Automáticas</h1>
                    <p className="text-gray-500">Personalize os e-mails enviados automaticamente pelo sistema.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lista de Templates */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400">Carregando...</div>
                    ) : templates.map(t => (
                        <div
                            key={t.id}
                            onClick={() => handleEdit(t)}
                            className={clsx(
                                "p-4 rounded-xl border-2 cursor-pointer transition",
                                editingTemplate?.id === t.id
                                    ? "border-indigo-600 bg-indigo-50"
                                    : "border-transparent bg-white hover:border-gray-200 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "p-2 rounded-lg",
                                    t.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t.slug}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor do Template Selecionado */}
                <div className="md:col-span-2">
                    {editingTemplate ? (
                        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-bold text-gray-900">Editando: {editingTemplate.name}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingTemplate.active}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, active: e.target.checked })}
                                            className="w-4 h-4 rounded text-indigo-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Ativo</span>
                                    </label>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assunto do E-mail</label>
                                    <input
                                        type="text"
                                        value={editingTemplate.subject}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura</label>
                                    <div className="flex items-center gap-2">
                                        <PenTool className="w-5 h-5 text-gray-400" />
                                        <select
                                            value={editingTemplate.signatureId || ''}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, signatureId: e.target.value || null })}
                                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Sem Assinatura</option>
                                            {signatures.map(sig => (
                                                <option key={sig.id} value={sig.id}>{sig.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">Conteúdo do E-mail</label>
                                        <span className="text-xs text-indigo-600 font-medium">Placeholders: {"{{verification_link}}"}</span>
                                    </div>
                                    <RichTextEditor
                                        value={editingTemplate.content}
                                        onChange={(val) => setEditingTemplate({ ...editingTemplate, content: val })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed rounded-xl p-20 text-center">
                            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-lg font-medium text-gray-900">Selecione um template</h2>
                            <p className="text-gray-500">Escolha uma mensagem automática na lista ao lado para editar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
