import { useState, useEffect } from 'react';
import { Mail, Plus, Send, Clock, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { api } from '../../api/axios';

export function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        subject: '',
        audience: 'NEWSLETTER_SUBSCRIBERS',
        content: '',
        signature: 'Atenciosamente,\nEquipe Ateliê Filhos de Aruanda'
    });

    useEffect(() => {
        loadCampaigns();
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

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const fullContent = `${newCampaign.content}\n\n--\n${newCampaign.signature}`;
            const { data } = await api.post('/marketing/campaigns', {
                ...newCampaign,
                content: fullContent
            });

            // Start the campaign immediately after creation
            await api.post(`/marketing/campaigns/${data.id}/start`);

            setIsModalOpen(false);
            setNewCampaign({
                name: '',
                subject: '',
                audience: 'NEWSLETTER_SUBSCRIBERS',
                content: '',
                signature: 'Atenciosamente,\nEquipe Ateliê Filhos de Aruanda'
            });
            loadCampaigns();
            alert('Campanha criada e iniciada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar campanha', error);
            alert('Erro ao criar campanha. Verifique os campos.');
        } finally {
            setIsSaving(false);
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nova Campanha
                </button>
            </div>

            {/* Modal de Nova Campanha */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleCreateCampaign}>
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Plus className="text-indigo-600" /> Nova Campanha
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-sans">
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Conteúdo da Mensagem</label>
                                    <textarea
                                        rows={6}
                                        required
                                        placeholder="Escreva sua mensagem aqui..."
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        value={newCampaign.content}
                                        onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })}
                                    />
                                </div>

                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <label className="block text-sm font-semibold text-indigo-900 mb-1 flex items-center gap-1">
                                        Assinatura do E-mail
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                                        value={newCampaign.signature}
                                        onChange={e => setNewCampaign({ ...newCampaign, signature: e.target.value })}
                                    />
                                    <p className="text-[10px] text-indigo-600 mt-1">* A assinatura será anexada ao final de cada e-mail.</p>
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
                                    {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Send size={18} />}
                                    {isSaving ? 'Enviando...' : 'Criar e Enviar Campanha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Total de Envios</h3>
                    <p className="text-2xl font-bold mt-2">{campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Campanhas Ativas</h3>
                    <p className="text-2xl font-bold mt-2 text-blue-600">{campaigns.filter(c => c.status === 'SENDING').length}</p>
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
                                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1">
                                        <RefreshCcw size={14} /> Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
