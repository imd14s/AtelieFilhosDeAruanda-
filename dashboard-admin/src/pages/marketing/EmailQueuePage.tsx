import { useState, useEffect } from 'react';
import { Mail, RefreshCcw, Trash2, AlertCircle, CheckCircle, Clock, Send, Zap, PenTool } from 'lucide-react';
import { api } from '../../api/axios';
import clsx from 'clsx';

interface EmailQueued {
    id: string;
    recipient: string;
    subject: string;
    status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
    type: string;
    scheduledAt: string;
    sentAt?: string;
    retryCount: number;
    lastError?: string;
}

export default function EmailQueuePage() {
    const [emails, setEmails] = useState<EmailQueued[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');

    const fetchQueue = async () => {
        try {
            const response = await api.get('/marketing/email-queue');
            setEmails(response.data);
        } catch (error) {
            console.error('Error fetching email queue:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    const handleRetry = async (id: string) => {
        try {
            await api.post(`/marketing/email-queue/${id}/retry`);
            fetchQueue();
        } catch (error) {
            console.error('Error retrying email:', error);
        }
    };

    const handleRetryAllFailed = async () => {
        if (!confirm('Deseja colocar todos os e-mails que falharam de volta na fila?')) return;
        try {
            await api.post('/marketing/email-queue/retry-failed');
            fetchQueue();
        } catch (error) {
            console.error('Error retrying all failed emails:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este e-mail da fila?')) return;
        try {
            await api.delete(`/marketing/email-queue/${id}`);
            setEmails(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    };

    const filteredEmails = emails.filter(e => filter === 'ALL' || e.status === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SENT': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return <Mail className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fila de E-mails</h1>
                    <p className="text-gray-500">Monitore e gerencie todos os disparos automáticos e campanhas.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRetryAllFailed}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Reenviar Falhas
                    </button>
                    <button
                        onClick={fetchQueue}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        title="Atualizar"
                    >
                        <RefreshCcw className={clsx("w-5 h-5", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex gap-2">
                    {['ALL', 'PENDING', 'SENT', 'FAILED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={clsx(
                                "px-3 py-1 text-sm font-medium rounded-full transition",
                                filter === s ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-600 border hover:bg-gray-100"
                            )}
                        >
                            {s === 'ALL' ? 'Todos' : s === 'PENDING' ? 'Pendente' : s === 'SENT' ? 'Enviado' : 'Falhou'}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b">
                                <th className="px-6 py-4">Destinatário</th>
                                <th className="px-6 py-4">Assunto</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Tentativas</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Carregando fila...</td>
                                </tr>
                            ) : filteredEmails.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhum e-mail encontrado na fila.</td>
                                </tr>
                            ) : (
                                filteredEmails.map(email => (
                                    <tr key={email.id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4 font-medium text-gray-900">{email.recipient}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{email.subject}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(email.status)}
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded text-xs font-medium",
                                                    email.status === 'SENT' && "bg-green-100 text-green-700",
                                                    email.status === 'FAILED' && "bg-red-100 text-red-700",
                                                    email.status === 'PENDING' && "bg-amber-100 text-amber-700"
                                                )}>
                                                    {email.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{email.retryCount}/3</td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {email.sentAt ? new Date(email.sentAt).toLocaleString('pt-BR') : new Date(email.scheduledAt).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                                                {(email.status === 'FAILED' || email.status === 'CANCELLED') && (
                                                    <button
                                                        onClick={() => handleRetry(email.id)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                                                        title="Tentar Novamente"
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(email.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="Remover"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {emails.some(e => e.lastError) && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-800">Erros recentes detectados</h3>
                        <p className="text-sm text-red-700 mt-1">Verifique os e-mails com status "FAILED" para ver o motivo da falha. O sistema tentará reenviar automaticamente até 3 vezes.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
