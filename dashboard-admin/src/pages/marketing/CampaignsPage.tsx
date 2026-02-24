import { useState, useEffect } from 'react';
import { Mail, Plus, Send, Clock, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { api } from '../../api/axios';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import BaseModal from '../../components/ui/BaseModal';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        subject: '',
        audience: 'NEWSLETTER_SUBSCRIBERS',
        content: '',
        signatureId: ''
    });
    const { addToast } = useToast();

    useEffect(() => {
        loadCampaigns();
        loadSignatures();
        const interval = setInterval(loadCampaigns, 600000); // 10 minutes auto-refresh
        return () => clearInterval(interval);
    }, []);

    const loadCampaigns = async () => {
        try {
            const { data } = await api.get('/marketing/campaigns');
            setCampaigns(data);
        } catch (error) {
            console.error('Erro ao carregar campanhas', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSignatures = async () => {
        try {
            const { data } = await api.get('/marketing/signatures');
            setSignatures(data);
            if (data.length > 0) {
                setNewCampaign((prev: any) => ({ ...prev, signatureId: data[0].id }));
            }
        } catch (error) {
            console.error('Erro ao carregar assinaturas', error);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingId) {
                await api.put(`/marketing/campaigns/${editingId}`, {
                    ...newCampaign,
                    signatureId: newCampaign.signatureId || null
                });
                addToast('Campanha atualizada com sucesso!', 'success');
            } else {
                await api.post('/marketing/campaigns', {
                    ...newCampaign,
                    signatureId: newCampaign.signatureId || null
                });
                addToast('Campanha criada com sucesso!', 'success');
            }

            // Removed auto-start to allow editing before sending
            // await api.post(`/marketing/campaigns/${data.id}/start`);

            setIsModalOpen(false);
            setNewCampaign({
                name: '',
                subject: '',
                audience: 'NEWSLETTER_SUBSCRIBERS',
                content: '',
                signatureId: signatures.length > 0 ? signatures[0].id : ''
            });
            setEditingId(null);
            loadCampaigns();
        } catch (error) {
            console.error('Erro ao criar campanha', error);
            addToast('Erro ao criar campanha. Verifique os campos.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartCampaign = async (id: string) => {
        if (!confirm('Deseja realmente iniciar o envio desta campanha?')) return;
        try {
            await api.post(`/marketing/campaigns/${id}/start`);
            addToast('Campanha iniciada com sucesso!', 'success');
            loadCampaigns();
        } catch (error) {
            console.error(error);
            addToast('Erro ao iniciar a campanha.', 'error');
        }
    };

    const handleCancelCampaign = async (id: string) => {
        if (!confirm('Tem certeza? Isso irá parar o envio para os destinatários restantes.')) return;
        try {
            await api.post(`/marketing/campaigns/${id}/cancel`);
            addToast('Campanha cancelada.', 'success');
            loadCampaigns();
        } catch (error) {
            console.error(error);
            addToast('Erro ao cancelar a campanha.', 'error');
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Você tem certeza que deseja excluir esta campanha e todos os seus dados?')) return;
        try {
            await api.delete(`/marketing/campaigns/${id}`);
            addToast('Campanha excluída.', 'success');
            loadCampaigns();
        } catch (error) {
            console.error(error);
            addToast('Erro ao excluir a campanha.', 'error');
        }
    };


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pendente</span>;
            case 'SENDING': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><RefreshCcw size={12} className="animate-spin" /> Enviando</span>;
            case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Concluída</span>;
            case 'FAILED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><AlertCircle size={12} /> Falhou</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-indigo-600" />
                        Campanhas de E-mail
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Envio em massa com monitoramento em tempo real (atualização a cada 10min).</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingId(null);
                        setNewCampaign({
                            name: '', subject: '', audience: 'NEWSLETTER_SUBSCRIBERS', content: '', signatureId: signatures.length > 0 ? signatures[0].id : ''
                        });
                        setIsModalOpen(true);
                    }}
                    variant="primary"
                    className="shadow-lg"
                >
                    <Plus size={20} />
                    Nova Campanha
                </Button>
            </div>

            {/* Modal de Nova Campanha */}
            <BaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Editar Campanha' : 'Nova Campanha'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateCampaign} className="space-y-4 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Interno</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Promoção de Outono 2024"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newCampaign.name}
                                onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Público Alvo</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newCampaign.audience}
                                onChange={e => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                            >
                                <option value="NEWSLETTER_SUBSCRIBERS">Assinantes da Newsletter</option>
                                <option value="ALL_CUSTOMERS">Todos os Clientes</option>
                                <option value="TEST">Apenas Teste (Admin)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assunto do E-mail</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Aproveite 20% de desconto em todo o site!"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newCampaign.subject}
                            onChange={e => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assinatura</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newCampaign.signatureId}
                            onChange={e => setNewCampaign({ ...newCampaign, signatureId: e.target.value })}
                        >
                            <option value="">Sem assinatura</option>
                            {signatures.map((sig: any) => (
                                <option key={sig.id} value={sig.id}>{sig.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Conteúdo da Mensagem</label>
                        <div className="bg-white">
                            <RichTextEditor
                                value={newCampaign.content}
                                onChange={content => setNewCampaign({ ...newCampaign, content })}
                                placeholder="Escreva sua mensagem aqui..."
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 italic">
                        * A assinatura selecionada acima será anexada automaticamente ao final do e-mail no momento do envio.
                    </p>

                    <div className="pt-4 border-t flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            variant="secondary"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSaving}
                            variant="primary"
                            className="px-6 shadow-lg"
                        >
                            <Send size={18} className="mr-2" />
                            {editingId ? 'Salvar Alterações' : 'Criar Campanha'}
                        </Button>
                    </div>
                </form>
            </BaseModal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total de Envios</h3>
                    <p className="text-2xl font-bold mt-2">{campaigns.reduce((acc: number, c: any) => acc + (c.sentCount || 0), 0)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Campanhas Ativas</h3>
                    <p className="text-2xl font-bold mt-2 text-blue-600">{campaigns.filter((c: any) => c.status === 'SENDING').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Taxa de Verificação</h3>
                    <p className="text-2xl font-bold mt-2 text-green-600">--%</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Campanha</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Progresso</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Carregando campanhas...</td></tr>
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma campanha encontrada.</td></tr>
                        ) : campaigns.map(campaign => (
                            <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-gray-900">{campaign.name}</p>
                                    <p className="text-xs text-gray-500">{campaign.subject}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(campaign.status)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-gray-100 rounded-full h-2 max-w-[150px]">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (campaign.sentCount / (campaign.totalRecipients || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">{campaign.sentCount} / {campaign.totalRecipients} enviados</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {campaign.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleStartCampaign(campaign.id)} className="text-green-600 hover:text-green-800 text-xs font-bold border px-2 py-1 flex items-center gap-1 rounded">
                                                    Iniciar
                                                </button>
                                                <button onClick={() => {
                                                    setEditingId(campaign.id);
                                                    setNewCampaign({
                                                        name: campaign.name,
                                                        subject: campaign.subject,
                                                        audience: campaign.audience,
                                                        content: campaign.content,
                                                        signatureId: campaign.signatureId || ''
                                                    });
                                                    setIsModalOpen(true);
                                                }} className="text-blue-600 hover:text-blue-800 text-xs font-bold border px-2 py-1 flex items-center gap-1 rounded">
                                                    Editar
                                                </button>
                                            </>
                                        )}
                                        {campaign.status === 'SENDING' && (
                                            <button onClick={() => handleCancelCampaign(campaign.id)} className="text-orange-600 hover:text-orange-800 text-xs font-bold border px-2 py-1 flex items-center gap-1 rounded">
                                                Cancelar
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteCampaign(campaign.id)} className="text-red-600 hover:text-red-800 text-xs font-bold border px-2 py-1 flex items-center gap-1 rounded">
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
