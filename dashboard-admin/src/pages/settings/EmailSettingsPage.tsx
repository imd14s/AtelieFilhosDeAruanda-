import { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle, Server, User, Lock, Globe } from 'lucide-react';
import { api } from '../../api/axios';

export function EmailSettingsPage() {
    const [configs, setConfigs] = useState({
        id: '',
        mailHost: '',
        mailPort: 587,
        mailUsername: '',
        mailPassword: '',
        mailSenderAddress: '',
        mailSenderName: ''
    });

    const SMTP_PROVIDERS = [
        { name: 'Personalizado', host: '', port: 587 },
        { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
        { name: 'Outlook / Hotmail', host: 'smtp-mail.outlook.com', port: 587 },
        { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587 },
        { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587 },
        { name: 'AWS SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587 },
        { name: 'Mailtrap (Teste)', host: 'sandbox.smtp.mailtrap.io', port: 2525 },
    ];

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/marketing/email-settings');
            if (res.data) {
                setConfigs(res.data);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            // Se for 404, apenas ignoramos pois o admin pode criar o primeiro
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await api.post('/marketing/email-settings', configs);
            setSuccessMessage('Configurações de e-mail atualizadas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            setErrorMessage('Ocorreu um erro ao salvar as configurações. Verifique os dados e tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Servidor de E-mail (SMTP)</h1>
                    <p className="text-gray-600 mt-1">Configure as credenciais de envio para que o sistema possa disparar e-mails para seus clientes.</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                    <Mail className="w-6 h-6 text-indigo-600" />
                </div>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">

                {/* Remetente Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Identidade do Remetente</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nome Exibido <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Ateliê Filhos de Aruanda"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={configs.mailSenderName}
                                onChange={(e) => setConfigs({ ...configs, mailSenderName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                E-mail Remetente <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="Ex: contato@ateliedearuanda.com.br"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={configs.mailSenderAddress}
                                onChange={(e) => setConfigs({ ...configs, mailSenderAddress: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Servidor SMTP Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Conexão com Servidor (SMTP)</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Sugestões:</label>
                            <select
                                className="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                                onChange={(e) => {
                                    const provider = SMTP_PROVIDERS.find(p => p.name === e.target.value);
                                    if (provider && provider.host) {
                                        setConfigs({ ...configs, mailHost: provider.host, mailPort: provider.port });
                                    }
                                }}
                            >
                                {SMTP_PROVIDERS.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Host do Servidor <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: smtp.gmail.com ou smtp.sendgrid.net"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={configs.mailHost}
                                    onChange={(e) => setConfigs({ ...configs, mailHost: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Porta <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                placeholder="587"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={configs.mailPort === 0 ? '' : configs.mailPort}
                                onChange={(e) => setConfigs({ ...configs, mailPort: e.target.value === '' ? 0 : (parseInt(e.target.value) || 0) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Usuário / Login
                            </label>
                            <input
                                type="text"
                                placeholder="Seu e-mail ou API Key"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={configs.mailUsername}
                                onChange={(e) => setConfigs({ ...configs, mailUsername: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2 relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Senha / App Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={configs.mailPassword}
                                    onChange={(e) => setConfigs({ ...configs, mailPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                    {showPassword ? "Esconder" : "Mostrar"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex gap-3 italic text-sm text-amber-800">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p>Dica: Para o Gmail, use uma "Senha de App". Para serviços como SendGrid ou SES, use a API Key como usuário.</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
                            }`}
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        {saving ? 'Salvando...' : 'Salvar e Ativar Configurações'}
                    </button>
                </div>
            </form>
        </div>
    );
}
