import { useState, useEffect } from 'react';
import { Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/axios';

export function EmailSettingsPage() {
    const [configs, setConfigs] = useState({
        MAIL_SENDER_NAME: '',
        MAIL_SENDER_ADDRESS: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/configs');
            const data = res.data;
            setConfigs({
                MAIL_SENDER_NAME: data.find((c: any) => c.configKey === 'MAIL_SENDER_NAME')?.configValue || 'Ateliê Filhos de Aruanda',
                MAIL_SENDER_ADDRESS: data.find((c: any) => c.configKey === 'MAIL_SENDER_ADDRESS')?.configValue || 'nao-responda@ateliedearuanda.com.br'
            });
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            setErrorMessage('Não foi possível carregar as configurações atuais.');
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
            const updates = [
                { configKey: 'MAIL_SENDER_NAME', configValue: configs.MAIL_SENDER_NAME, description: 'Nome do Remetente de E-mail' },
                { configKey: 'MAIL_SENDER_ADDRESS', configValue: configs.MAIL_SENDER_ADDRESS, description: 'Endereço do Remetente de E-mail' }
            ];

            for (const update of updates) {
                await api.post('/admin/configs', update);
            }

            setSuccessMessage('Configurações de remetente atualizadas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            setErrorMessage('Ocorreu um erro ao salvar as configurações.');
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Remetente de E-mail</h1>
                    <p className="text-gray-600 mt-1">Configure o nome e endereço que aparecerão para os clientes ao receberem e-mails da sua loja.</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                    <Mail className="w-6 h-6 text-indigo-600" />
                </div>
            </div>

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Nome do Remetente <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Ateliê Filhos de Aruanda"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={configs.MAIL_SENDER_NAME}
                            onChange={(e) => setConfigs({ ...configs, MAIL_SENDER_NAME: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">O nome que aparecerá na caixa de entrada do cliente.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            E-mail Remetente <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="Ex: contato@ateliedearuanda.com.br"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={configs.MAIL_SENDER_ADDRESS}
                            onChange={(e) => setConfigs({ ...configs, MAIL_SENDER_ADDRESS: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">O endereço que envia o e-mail. Para evitar caixas de SPAM, use um domínio verificado.</p>
                    </div>
                </div>

                {/* Preview Secion */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" /> Pré-visualização na Caixa de Entrada
                    </h3>
                    <div className="bg-white rounded border border-gray-200 p-4 shadow-sm relative">
                        <div className="flex flex-col mb-1 pb-3 border-b border-gray-100">
                            <span className="font-bold text-gray-900 leading-tight">
                                {configs.MAIL_SENDER_NAME || 'Nome Indefinido'}
                            </span>
                            <span className="text-xs text-gray-500">
                                &lt;{configs.MAIL_SENDER_ADDRESS || 'email@indefinido.com'}&gt;
                            </span>
                        </div>
                        <div className="pt-2">
                            <span className="font-semibold text-gray-800 text-sm">Atualização do Pedido #12345</span>
                            <p className="text-sm text-gray-600 truncate mt-1">Olá João, seu pedido foi enviado com sucesso e está a caminho...</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center px-6 py-2.5 rounded-lg text-white font-medium transition-colors ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}
