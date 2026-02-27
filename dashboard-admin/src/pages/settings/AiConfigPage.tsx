import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Zap } from 'lucide-react';
import { api } from '../../api/axios';

interface AiConfigFormData {
    nomeIa: string;
    apiKey: string;
    prePrompt: string;
}

export function AiConfigPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState<AiConfigFormData>({
        nomeIa: 'Gemini',
        apiKey: '',
        prePrompt: 'Gere um título otimizado e uma descrição atrativa para o seguinte produto. Retorne apenas JSON com as chaves "title" e "description".'
    });

    useEffect(() => {
        loadConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/configs/ai');
            const geminiConfig = Array.isArray(data) ? data.find((c: Record<string, unknown>) => c.nomeIa === 'Gemini') : undefined;

            if (geminiConfig) {
                setFormData({
                    nomeIa: geminiConfig.nomeIa,
                    apiKey: geminiConfig.apiKey,
                    prePrompt: geminiConfig.prePrompt || formData.prePrompt
                });
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de IA:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');
        setIsLoading(true);

        try {
            await api.post('/configs/ai', formData);
            setSuccessMsg('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configuração de IA:', error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrorMsg(err.response?.data?.message || 'Erro ao salvar configuração.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inteligência Artificial</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Configure as chaves e prompts para geração automática de conteúdo.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {successMsg && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                            <div className="ml-3 flex-1">
                                <p className="text-sm text-green-700">{successMsg}</p>
                            </div>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                                <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome da IA
                            </label>
                            <input
                                type="text"
                                name="nomeIa"
                                value={formData.nomeIa}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                O sistema utiliza a integração com o Google Gemini.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API Key <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Zap className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="apiKey"
                                    value={formData.apiKey}
                                    onChange={handleChange}
                                    required
                                    placeholder="AIzaSyB..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Obtenha sua chave no Google AI Studio.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pre-prompt Baseline
                            </label>
                            <textarea
                                name="prePrompt"
                                rows={4}
                                value={formData.prePrompt}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Ex: Gere um título e uma descrição atrativa para..."
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Instruções básicas enviadas para a IA antes de enviar o título e a imagem do produto.
                                Importante manter a instrução de retorno em JSON.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-colors flex items-center gap-2 disabled:bg-indigo-400"
                        >
                            <Save size={20} />
                            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
