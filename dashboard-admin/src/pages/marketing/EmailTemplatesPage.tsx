import { useState, useEffect } from 'react';
import { Mail, Save, PenTool, Edit2, Plus, Trash2, X } from 'lucide-react';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        slug: '',
        subject: '',
        content: '',
        signatureId: '',
        active: true
    });

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
            alert('Template atualizado com sucesso!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Erro ao salvar template.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await api.post('/marketing/email-templates', {
                ...newTemplate,
                signatureId: newTemplate.signatureId || null
            });
            setTemplates(prev => [...prev, res.data]);
            setIsModalOpen(false);
            setNewTemplate({
                name: '',
                slug: '',
                subject: '',
                content: '',
                signatureId: '',
                active: true
            });
            alert('Template criado com sucesso!');
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Erro ao criar template. Verifique se o slug é único.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este template?')) return;
        try {
            await api.delete(`/marketing/email-templates/${id}`);
            setTemplates(prev => prev.filter(t => t.id !== id));
            if (editingTemplate?.id === id) setEditingTemplate(null);
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Erro ao excluir template.');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mensagens Automáticas</h1>
                    <p className="text-gray-500">Personalize os e-mails enviados automaticamente pelo sistema.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nova Mensagem
                </button>
            </div>

            {/* Modal de Criação */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleCreate}>
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Plus className="text-indigo-600" /> Novo Template
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Boas-vindas"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={newTemplate.name}
                                            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Identificador (Slug)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: WELCOME_EMAIL"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                            value={newTemplate.slug}
                                            onChange={e => setNewTemplate({ ...newTemplate, slug: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assunto do E-mail</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Assunto que o cliente verá"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newTemplate.subject}
                                        onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assinatura</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newTemplate.signatureId}
                                        onChange={e => setNewTemplate({ ...newTemplate, signatureId: e.target.value })}
                                    >
                                        <option value="">Sem assinatura</option>
                                        {signatures.map(sig => (
                                            <option key={sig.id} value={sig.id}>{sig.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Conteúdo</label>
                                    <RichTextEditor
                                        value={newTemplate.content}
                                        onChange={content => setNewTemplate({ ...newTemplate, content })}
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center gap-2"
                                >
                                    {isSaving ? 'Criando...' : 'Criar Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                "p-4 rounded-xl border-2 cursor-pointer transition group relative",
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
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t.slug}</p>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(t.id, e)}
                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
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
                                        {isSaving ? 'Salvando...' : 'Salvar'}
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
                                        <span className="text-xs text-indigo-600 font-medium italic">Dica: use {"{{customer_name}}"} ou {"{{verification_link}}"} conforme template.</span>
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
                            <p className="text-gray-500">Escolha uma mensagem automática na lista ao lado para editar ou crie uma nova.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
