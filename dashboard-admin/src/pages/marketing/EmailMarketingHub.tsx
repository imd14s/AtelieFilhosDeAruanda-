import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Mail, PenTool, Settings,
    RefreshCcw, AlertCircle, CheckCircle, Clock,
    Trash2, Save, Plus, X, Edit2, Server,
    User, Send, Upload, Eye, Info
} from 'lucide-react';
import { api } from '../../api/axios';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { MediaService } from '../../services/MediaService';
import clsx from 'clsx';

// --- Types ---
interface EmailMetric {
    totalSent: number;
    failed: number;
    pending: number;
    verifiedUsers: number;
}

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

interface EmailTemplate {
    id: string;
    slug: string;
    name: string;
    subject: string;
    content: string;
    signatureId: string | null;
    active: boolean;
}

interface Signature {
    id?: string;
    name: string;
    ownerName: string;
    role: string;
    storeName: string;
    whatsapp: string;
    email: string;
    storeUrl: string;
    logoUrl: string;
    motto: string;
}

interface SMTPConfig {
    id: string;
    mailHost: string;
    mailPort: number;
    mailUsername: string;
    mailPassword?: string;
    mailSenderAddress: string;
    mailSenderName: string;
}

const AUTOMATION_TYPES = [
    { id: 'NEWSLETTER_CONFIRM', label: 'Inscrição Newsletter', icon: '✉️' },
    { id: 'USER_VERIFY', label: 'Verificação de Conta', icon: '👤' },
    { id: 'ORDER_CONFIRM', label: 'Confirmação de Pedido', icon: '🛍️' },
    { id: 'PASSWORD_RESET', label: 'Troca de Senha', icon: '🔑' },
    { id: 'CAMPAIGN', label: 'Campanha Manual', icon: '🚀' }
];

const SMTP_PROVIDERS = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
    { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587 },
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587 },
    { name: 'SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587 },
    { name: 'Custom', host: '', port: 587 }
];

export default function EmailMarketingHub() {
    const [activeTab, setActiveTab] = useState<'analytics' | 'design' | 'config'>('analytics');
    const [activeDesignSubTab, setActiveDesignSubTab] = useState<'templates' | 'signatures'>('templates');

    // --- State: Analytics ---
    const [metrics, setMetrics] = useState<EmailMetric>({ totalSent: 0, failed: 0, pending: 0, verifiedUsers: 0 });
    const [queue, setQueue] = useState<EmailQueued[]>([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [queueFilter, setQueueFilter] = useState<string>('ALL');

    // --- State: Design (Templates) ---
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        slug: '',
        subject: '',
        content: '',
        signatureId: '',
        active: true
    });

    // --- State: Design (Signatures) ---
    const [isSavingSignature, setIsSavingSignature] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
    const [signatureForm, setSignatureForm] = useState<Signature>({
        name: 'Assinatura Principal',
        ownerName: '',
        role: 'Direção',
        storeName: 'Ateliê Filhos de Aruanda',
        whatsapp: '',
        email: '',
        storeUrl: 'https://www.atelie.com.br',
        logoUrl: 'https://via.placeholder.com/150',
        motto: 'Arte e Espiritualidade guiando nossos caminhos.'
    });

    // --- State: Config (SMTP) ---
    const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
        id: '',
        mailHost: '',
        mailPort: 587,
        mailUsername: '',
        mailPassword: '',
        mailSenderAddress: '',
        mailSenderName: ''
    });
    const [isSavingSMTP, setIsSavingSMTP] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- Utils ---
    const formatPhone = (value: string) => {
        if (!value) return value;
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 10) {
            return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    // --- Effects: Data Loading ---
    useEffect(() => {
        if (activeTab === 'analytics') loadAnalytics();
        if (activeTab === 'design') loadDesignData();
        if (activeTab === 'config') loadSMTPConfigs();
    }, [activeTab]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'analytics') loadAnalytics(false);
        }, 30000);
        return () => clearInterval(interval);
    }, [activeTab]);

    // --- Logic: Analytics ---
    const loadAnalytics = async (showLoading = true) => {
        if (showLoading) setLoadingAnalytics(true);
        try {
            const [metricsRes, queueRes] = await Promise.all([
                api.get('/marketing/metrics'),
                api.get('/marketing/email-queue')
            ]);
            const rawMetrics = metricsRes.data;
            setMetrics({
                totalSent: rawMetrics.emailsSent || 0,
                failed: queueRes.data.filter((e: any) => e.status === 'FAILED').length,
                pending: queueRes.data.filter((e: any) => e.status === 'PENDING').length,
                verifiedUsers: rawMetrics.verifiedUsers || 0
            });
            setQueue(queueRes.data.reverse());
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const handleRetryEmail = async (id: string) => {
        try {
            await api.post(`/marketing/email-queue/${id}/retry`);
            loadAnalytics(false);
        } catch (error) {
            console.error('Error retrying email:', error);
        }
    };

    const handleRetryAllFailed = async () => {
        if (!confirm('Deseja reenviar todos os e-mails com falha?')) return;
        try {
            await api.post('/marketing/email-queue/retry-failed');
            loadAnalytics(false);
        } catch (error) {
            console.error('Error retrying failed emails:', error);
        }
    };

    // --- Logic: Design (Templates) ---
    const loadDesignData = async () => {
        try {
            const [templatesRes, signaturesRes] = await Promise.all([
                api.get('/marketing/email-templates'),
                api.get('/marketing/signatures')
            ]);
            setTemplates(templatesRes.data);
            setSignatures(signaturesRes.data);
            if (signaturesRes.data.length > 0 && !selectedSignatureId) {
                handleSelectSignature(signaturesRes.data[0]);
            }
        } catch (error) {
            console.error('Error loading design data:', error);
        }
    };

    const handleSaveTemplate = async () => {
        if (!editingTemplate) return;
        setIsSavingTemplate(true);
        const payload = {
            ...editingTemplate,
            automationType: editingTemplate.slug, // O slug aqui representa o enum fixo
        };
        try {
            await api.put(`/marketing/email-templates/${editingTemplate.id}`, payload);
            setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...payload } : t));
            alert('Template salvo!');
        } catch (error: any) {
            console.error('Error saving template:', error.response?.data || error);
            alert(`Erro ao salvar template: ${error.response?.data?.message || 'Erro desconhecido'}`);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingTemplate(true);
        const payload = {
            ...newTemplate,
            automationType: newTemplate.slug,
            signatureId: newTemplate.signatureId || null
        };
        try {
            const res = await api.post('/marketing/email-templates', payload);
            setTemplates(prev => [...prev, res.data]);
            setIsCreatingTemplate(false);
            setNewTemplate({ name: '', slug: '', subject: '', content: '', signatureId: '', active: true });
        } catch (error: any) {
            console.error('Error creating template:', error.response?.data || error);
            alert(`Erro ao criar template: ${error.response?.data?.message || 'Erro desconhecido'}`);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Excluir este template permanentemente?')) return;
        try {
            await api.delete(`/marketing/email-templates/${id}`);
            setTemplates(prev => prev.filter(t => t.id !== id));
            if (editingTemplate?.id === id) setEditingTemplate(null);
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    // --- Logic: Design (Signatures) ---
    const handleSelectSignature = (sig: Signature) => {
        setSelectedSignatureId(sig.id || null);
        setSignatureForm(sig);
    };

    const handleNewSignature = () => {
        setSelectedSignatureId(null);
        setSignatureForm({
            name: 'Nova Assinatura',
            ownerName: '',
            role: 'Direção',
            storeName: 'Ateliê Filhos de Aruanda',
            whatsapp: '',
            email: '',
            storeUrl: 'https://www.atelie.com.br',
            logoUrl: 'https://via.placeholder.com/150',
            motto: ''
        });
    }

    const handleSaveSignature = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSignature(true);
        console.log('DEBUG: Saving signature payload:', JSON.stringify(signatureForm));
        try {
            await api.post('/marketing/signatures', signatureForm);
            loadDesignData();
            alert('Assinatura salva!');
        } catch (error: any) {
            console.error('Error saving signature:', error.response?.data || error);
            alert(`Erro ao salvar assinatura: ${error.response?.data?.message || 'Erro desconhecido'}`);
        } finally {
            setIsSavingSignature(false);
        }
    };

    const handleDeleteSignature = async (id: string) => {
        if (!confirm('Deseja excluir esta assinatura?')) return;
        try {
            await api.delete(`/marketing/signatures/${id}`);
            loadDesignData();
            handleNewSignature();
        } catch (error) {
            console.error('Error deleting signature:', error);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            setUploadProgress(0);
            try {
                const response = await MediaService.upload(e.target.files[0], (p) => setUploadProgress(p));
                setSignatureForm(prev => ({ ...prev, logoUrl: response.url }));
            } catch (err) {
                console.error("Upload failed", err);
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/150';
        if (url.startsWith('http')) return url;

        // Evita erro de rede se a URL for apenas um número (como 150 do placeholder)
        if (/^\d+$/.test(url)) return `https://via.placeholder.com/${url}`;

        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const cleanBase = apiUrl.replace(/\/api$/, '');

        return `${cleanBase}${cleanUrl}`;
    };

    const renderSignaturePreview = () => {
        const storeUrlLabel = signatureForm.storeUrl.replace(/https?:\/\//, '').replace('www.', '');
        return (
            <div className="bg-white border p-8 rounded-xl shadow-inner min-h-[200px] flex items-center justify-center">
                <table cellPadding="0" cellSpacing="0" border={0} style={{ fontFamily: 'Arial, sans-serif', color: '#1B2B42', width: '100%', maxWidth: '500px' }}>
                    <tbody>
                        <tr>
                            <td width="130" style={{ paddingRight: '20px', borderRight: '2px solid #D4AF37' }}>
                                <img src={getImageUrl(signatureForm.logoUrl)} alt="Logo" width="110" style={{ display: 'block', borderRadius: '50%', border: '1px solid #EBEBEB' }} />
                            </td>
                            <td style={{ paddingLeft: '20px' }}>
                                <h2 style={{ margin: '0 0 4px 0', color: '#1B2B42', fontSize: '20px', fontWeight: 'bold' }}>{signatureForm.ownerName || '[Seu Nome]'}</h2>
                                <p style={{ margin: '0 0 12px 0', color: '#555555', fontSize: '14px' }}>
                                    {signatureForm.role} | <strong style={{ color: '#1B2B42' }}>{signatureForm.storeName}</strong>
                                </p>
                                <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.6', color: '#333333' }}>
                                    <span style={{ color: '#D4AF37' }}>✦</span> <strong>WhatsApp:</strong> {signatureForm.whatsapp || '(00) 00000-0000'}<br />
                                    <span style={{ color: '#D4AF37' }}>✦</span> <strong>E-mail:</strong> <span style={{ color: '#1B2B42' }}>{signatureForm.email || 'contato@empresa.com'}</span><br />
                                    <span style={{ color: '#D4AF37' }}>✦</span> <strong>Loja:</strong> <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{storeUrlLabel || 'www.loja.com.br'}</span>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ paddingTop: '15px' }}>
                                <p style={{ margin: '0', fontSize: '12px', color: '#777777', fontStyle: 'italic', borderTop: '1px solid #EEEEEE', paddingTop: '8px' }}>
                                    {signatureForm.motto || 'Sua frase de efeito aqui.'}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    // --- Logic: Config (SMTP) ---
    const loadSMTPConfigs = async () => {
        try {
            const res = await api.get('/marketing/email-settings');
            if (res.data) setSmtpConfig(res.data);
        } catch (error) {
            console.error('Error loading SMTP configs:', error);
        }
    };

    const handleApplyProvider = (p: typeof SMTP_PROVIDERS[0]) => {
        if (p.name === 'Custom') {
            setSmtpConfig(prev => ({ ...prev, mailHost: '', mailPort: 587 }));
        } else {
            setSmtpConfig(prev => ({ ...prev, mailHost: p.host, mailPort: p.port }));
        }
    };

    const handleSaveSMTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSMTP(true);
        try {
            await api.post('/marketing/email-settings', smtpConfig);
            alert('Configurações SMTP salvas!');
        } catch (error) {
            console.error('Error saving SMTP settings:', error);
            alert('Erro ao salvar SMTP.');
        } finally {
            setIsSavingSMTP(false);
        }
    };

    // --- Helper UI ---
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SENT': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'FAILED': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return <Mail className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredQueue = queue.filter(e => queueFilter === 'ALL' || e.status === queueFilter);

    // --- RENDERS ---

    const renderAnalytics = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Enviado', value: metrics.totalSent, icon: Send, color: 'indigo' },
                    { label: 'Em Pendência', value: metrics.pending, icon: Clock, color: 'amber' },
                    { label: 'Falhas de Envio', value: metrics.failed, icon: AlertCircle, color: 'red' },
                    { label: 'Usuários Verificados', value: metrics.verifiedUsers, icon: CheckCircle, color: 'green' },
                ].map(card => (
                    <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 bg-${card.color}-100 rounded-xl text-${card.color}-600`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <RefreshCcw size={18} className={loadingAnalytics ? "animate-spin text-indigo-500" : ""} />
                        Fila de Processamento
                    </h2>
                    <div className="flex gap-2">
                        {['ALL', 'PENDING', 'SENT', 'FAILED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setQueueFilter(f)}
                                className={clsx(
                                    "px-3 py-1 text-xs font-bold rounded-full transition",
                                    queueFilter === f ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {f === 'ALL' ? 'Tudo' : f === 'PENDING' ? 'Pendentes' : f === 'SENT' ? 'Enviados' : 'Falhas'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Destinatário</th>
                                <th className="px-6 py-3">Assunto</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {filteredQueue.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">Nenhum e-mail na fila.</td></tr>
                            ) : filteredQueue.map(email => (
                                <tr key={email.id} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4 font-semibold text-gray-700">{email.recipient}</td>
                                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{email.subject}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(email.status)}
                                            <span className={clsx(
                                                "text-xs font-bold",
                                                email.status === 'SENT' && "text-green-600",
                                                email.status === 'FAILED' && "text-red-600",
                                                email.status === 'PENDING' && "text-amber-600"
                                            )}>{email.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {email.status === 'FAILED' && (
                                            <button
                                                onClick={() => handleRetryEmail(email.id)}
                                                className="p-1.5 bg-gray-100 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                                            >
                                                <RefreshCcw size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderDesign = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex gap-4 p-1 bg-gray-100 rounded-xl w-fit">
                {[
                    { id: 'templates', label: 'Templates de E-mail', icon: Mail },
                    { id: 'signatures', label: 'Assinaturas Digitais', icon: PenTool }
                ].map(st => (
                    <button
                        key={st.id}
                        onClick={() => setActiveDesignSubTab(st.id as any)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                            activeDesignSubTab === st.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <st.icon size={16} /> {st.label}
                    </button>
                ))}
            </div>

            {activeDesignSubTab === 'templates' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setIsCreatingTemplate(true);
                                setEditingTemplate(null);
                            }}
                            className={clsx(
                                "w-full p-4 border-2 border-dashed rounded-2xl font-bold flex items-center justify-center gap-2 transition",
                                isCreatingTemplate ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                            )}
                        >
                            <Plus size={20} /> Novo Template
                        </button>
                        {templates.map(t => (
                            <div
                                key={t.id}
                                onClick={() => {
                                    setEditingTemplate(t);
                                    setIsCreatingTemplate(false);
                                }}
                                className={clsx(
                                    "p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                    editingTemplate?.id === t.id ? "border-indigo-600 bg-indigo-50" : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{t.name}</h4>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">{t.slug}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition">
                                            <Trash2 size={14} />
                                        </button>
                                        <div className={clsx("w-2 h-2 rounded-full", t.active ? "bg-green-500" : "bg-gray-300")} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-2">
                        {isCreatingTemplate ? (
                            <div className="bg-white rounded-2xl border shadow-xl p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <Plus className="text-indigo-600" size={24} /> Criar Novo Template
                                    </h3>
                                    <button onClick={() => setIsCreatingTemplate(false)} className="p-2 text-gray-400 hover:text-gray-600"><X /></button>
                                </div>
                                <form onSubmit={handleCreateTemplate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Tipo de Automação</label>
                                            <select
                                                className="w-full p-4 border-2 rounded-xl bg-gray-50 outline-none focus:border-indigo-600 font-bold text-sm text-gray-700 transition-all"
                                                value={newTemplate.slug}
                                                onChange={e => {
                                                    const selected = AUTOMATION_TYPES.find(t => t.id === e.target.value);
                                                    setNewTemplate({
                                                        ...newTemplate,
                                                        slug: e.target.value,
                                                        name: selected?.label || ''
                                                    });
                                                }}
                                                required
                                            >
                                                <option value="">Selecione um evento...</option>
                                                {AUTOMATION_TYPES.map(type => (
                                                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Assunto do E-mail</label>
                                            <input
                                                className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                                placeholder="Ex: Boas-vindas ao Ateliê!"
                                                value={newTemplate.subject}
                                                onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Assinatura Digital</label>
                                        <select
                                            className="w-full p-3 border rounded-xl outline-none"
                                            value={newTemplate.signatureId}
                                            onChange={e => setNewTemplate({ ...newTemplate, signatureId: e.target.value })}
                                        >
                                            <option value="">Nenhuma</option>
                                            {signatures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Corpo do E-mail</label>
                                        <div className="min-h-[400px] border rounded-2xl overflow-hidden bg-gray-50">
                                            <RichTextEditor value={newTemplate.content} onChange={v => setNewTemplate({ ...newTemplate, content: v })} />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="submit"
                                            disabled={isSavingTemplate}
                                            className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:bg-indigo-300"
                                        >
                                            {isSavingTemplate ? 'CRIANDO...' : 'CRIAR TEMPLATE AGORA'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : editingTemplate ? (
                            <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <Edit2 size={24} className="text-indigo-600" /> {editingTemplate.name}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveTemplate}
                                            disabled={isSavingTemplate}
                                            className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-sm hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2 shadow-lg"
                                        >
                                            <Save size={18} /> {isSavingTemplate ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                        </button>
                                        <button
                                            onClick={() => setEditingTemplate(null)}
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Nome do Template</label>
                                            <input
                                                className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                                                value={editingTemplate.name}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Slug Identificador</label>
                                            <input
                                                className="w-full px-4 py-3 border rounded-xl bg-gray-50 text-gray-500 text-sm font-bold uppercase"
                                                value={editingTemplate.slug}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Assunto do E-mail</label>
                                        <input
                                            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                            value={editingTemplate.subject}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Assinatura</label>
                                        <select
                                            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            value={editingTemplate.signatureId || ''}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, signatureId: e.target.value || null })}
                                        >
                                            <option value="">Sem Assinatura</option>
                                            {signatures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Corpo do E-mail</label>
                                        <div className="min-h-[450px] border rounded-2xl overflow-hidden bg-gray-50">
                                            <RichTextEditor
                                                value={editingTemplate.content}
                                                onChange={val => setEditingTemplate({ ...editingTemplate, content: val })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                                        <Info size={20} className="text-blue-500 mt-1" />
                                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                            <strong>Tags Dinâmicas:</strong> Use chaves triplas para dados automáticos: <br />
                                            <code className="bg-white/50 px-2 py-0.5 rounded mr-2 mt-1 inline-block">{"{{{customer_name}}}"}</code>
                                            <code className="bg-white/50 px-2 py-0.5 rounded mr-2 mt-1 inline-block">{"{{{order_id}}}"}</code>
                                            <code className="bg-white/50 px-2 py-0.5 rounded mr-2 mt-1 inline-block">{"{{{verification_link}}}"}</code>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed rounded-2xl p-12 text-gray-400">
                                <Mail size={48} className="mb-4 opacity-20" />
                                <p className="font-bold">Selecione um template para editar</p>
                                <p className="text-xs">Escolha na lista lateral para ajustar os textos automáticos.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <button
                            onClick={handleNewSignature}
                            className="w-full p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
                        >
                            <Plus size={20} /> Nova Assinatura
                        </button>
                        <div className="space-y-2">
                            {signatures.map(sig => (
                                <button
                                    key={sig.id}
                                    onClick={() => handleSelectSignature(sig)}
                                    className={clsx(
                                        "w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group",
                                        selectedSignatureId === sig.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                                    )}
                                >
                                    <div>
                                        <p className="font-bold text-sm text-gray-700">{sig.name}</p>
                                        <p className="text-xs text-gray-500">{sig.ownerName || 'Sem dono'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedSignatureId === sig.id ? <CheckCircle size={18} className="text-indigo-600" /> : <div className="w-18 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} className="text-red-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteSignature(sig.id!); }} /></div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b flex items-center gap-2">
                                <Eye size={18} className="text-gray-400" />
                                <span className="text-sm font-bold text-gray-600">Visualização em Tempo Real</span>
                            </div>
                            <div className="p-6 bg-gray-100">
                                {renderSignaturePreview()}
                            </div>
                        </div>

                        <form onSubmit={handleSaveSignature} className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-800 border-b pb-2">Informações Pessoais</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome Interno</label>
                                            <input type="text" required value={signatureForm.name} onChange={e => setSignatureForm({ ...signatureForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Seu Nome (Exibido)</label>
                                            <input type="text" required value={signatureForm.ownerName} onChange={e => setSignatureForm({ ...signatureForm, ownerName: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cargo / Função</label>
                                            <input type="text" required value={signatureForm.role} onChange={e => setSignatureForm({ ...signatureForm, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-800 border-b pb-2">Contato e Branding</h4>
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Logo da Assinatura</label>
                                            <div className="flex items-center gap-4 p-3 border rounded-xl bg-gray-50">
                                                <div className="w-12 h-12 rounded-full border bg-white overflow-hidden relative">
                                                    <img src={getImageUrl(signatureForm.logoUrl)} className="w-full h-full object-cover" />
                                                    {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><RefreshCcw size={14} className="animate-spin text-indigo-600" /></div>}
                                                </div>
                                                <label className="cursor-pointer px-3 py-1.5 bg-white border rounded-lg text-xs font-bold hover:bg-gray-100 transition shadow-sm flex items-center gap-2">
                                                    <Upload size={14} /> {isUploading ? `${uploadProgress}%` : 'Alterar'}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                            <input
                                                type="text" required
                                                value={signatureForm.whatsapp}
                                                onChange={e => setSignatureForm({ ...signatureForm, whatsapp: formatPhone(e.target.value) })}
                                                className="w-full px-4 py-2 border rounded-lg text-sm"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">E-mail de Contato</label>
                                            <input type="email" required value={signatureForm.email} onChange={e => setSignatureForm({ ...signatureForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 border-b pb-2">Detalhes da Loja</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome da Loja</label>
                                        <input type="text" required value={signatureForm.storeName} onChange={e => setSignatureForm({ ...signatureForm, storeName: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">URL da Loja</label>
                                        <input type="url" required value={signatureForm.storeUrl} onChange={e => setSignatureForm({ ...signatureForm, storeUrl: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                                    </div>
                                </div>
                                <input type="text" required placeholder="Lema / Frase de efeito" value={signatureForm.motto} onChange={e => setSignatureForm({ ...signatureForm, motto: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm" />
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                <button type="submit" disabled={isSavingSignature} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center gap-2">
                                    <Save size={18} /> {isSavingSignature ? 'Salvando...' : 'Salvar Assinatura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    const renderConfig = () => (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 bg-indigo-600 text-white text-center">
                    <div className="flex flex-col items-center mb-6">
                        <div className="p-4 bg-white/20 rounded-full mb-4">
                            <Server size={40} />
                        </div>
                        <h1 className="text-2xl font-bold">Servidor SMTP</h1>
                        <p className="text-white/70 text-sm max-w-sm">Configure o motor para envios automáticos e campanhas.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {SMTP_PROVIDERS.map(p => (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => handleApplyProvider(p)}
                                className={clsx(
                                    "px-5 py-2.5 rounded-xl text-sm font-bold transition-all border",
                                    smtpConfig.mailHost === p.host && p.host !== '' ? "bg-white text-indigo-600 border-white shadow-lg" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                                )}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSaveSMTP} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b pb-2">Identidade</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Nome Exibido</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-gray-300" size={18} />
                                        <input className="w-full pl-10 pr-4 py-2 border rounded-xl" placeholder="Ateliê Filhos de Aruanda" value={smtpConfig.mailSenderName} onChange={e => setSmtpConfig({ ...smtpConfig, mailSenderName: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">E-mail Remetente</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-gray-300" size={18} />
                                        <input type="email" className="w-full pl-10 pr-4 py-2 border rounded-xl" placeholder="contato@atelie.com.br" value={smtpConfig.mailSenderAddress} onChange={e => setSmtpConfig({ ...smtpConfig, mailSenderAddress: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest border-b pb-2">Servidor</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Host</label>
                                    <input className="w-full px-3 py-2 border rounded-xl" placeholder="smtp.servidor.com" value={smtpConfig.mailHost} onChange={e => setSmtpConfig({ ...smtpConfig, mailHost: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Porta</label>
                                    <input type="number" className="w-full px-3 py-2 border rounded-xl text-center" value={smtpConfig.mailPort} onChange={e => setSmtpConfig({ ...smtpConfig, mailPort: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Usuário / API Key</label>
                                <input className="w-full px-3 py-2 border rounded-xl" value={smtpConfig.mailUsername} onChange={e => setSmtpConfig({ ...smtpConfig, mailUsername: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Senha / Token</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} className="w-full px-3 py-2 border rounded-xl" value={smtpConfig.mailPassword} onChange={e => setSmtpConfig({ ...smtpConfig, mailPassword: e.target.value })} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[9px] font-black text-indigo-500 uppercase">{showPassword ? "Ocultar" : "Mostrar"}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t flex justify-end">
                        <button type="submit" disabled={isSavingSMTP} className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:bg-indigo-300">
                            {isSavingSMTP ? 'SALVANDO...' : 'SALVAR E ATATIVAR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">E-mail Marketing</h1>
                    <p className="text-gray-500 font-medium mt-1">Sua central unificada de automação e comunicações.</p>
                </div>

                <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100">
                    {[
                        { id: 'analytics', label: 'Monitoramento', icon: LayoutDashboard },
                        { id: 'design', label: 'Criação', icon: PenTool },
                        { id: 'config', label: 'Infraestrutura', icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'design' && renderDesign()}
                {activeTab === 'config' && renderConfig()}
            </div>

        </div>
    );
}
