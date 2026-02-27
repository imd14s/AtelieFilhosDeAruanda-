import { useState, useEffect } from 'react';
import { ConfigService } from '../../services/ConfigService';

import type { SystemConfig } from '../../types/config';
import { Trash2, Plus, Save } from 'lucide-react';
import BaseModal from '../../components/ui/BaseModal';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export function ConfigPage() {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [configKey, setConfigKey] = useState('');
    const [configValue, setConfigValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const data = await ConfigService.getAll();
            setConfigs(data);
        } catch (error) {
            console.error('Erro ao carregar configurações', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (keyToDelete: string) => {
        if (!confirm(`Tem certeza que deseja remover a configuração ${keyToDelete}?`)) return;
        try {
            await ConfigService.delete(keyToDelete);
            setConfigs((prev: SystemConfig[]) => prev.filter(c => c.configKey !== keyToDelete));
            addToast('Configuração removida.', 'success');
        } catch (error) {
            addToast('Não foi possível excluir esta configuração.', 'error');
            console.error(error);
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await ConfigService.upsert({ configKey, configValue });
            await loadConfigs();
            setIsModalOpen(false);
            setConfigKey(''); setConfigValue('');
            addToast('Configuração salva com sucesso!', 'success');
        } catch (error) {
            addToast('Não foi possível salvar.', 'error');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
                    <p className="text-gray-500">Feature Flags e Variáveis Globais</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                    className="shadow-lg"
                >
                    <Plus size={20} />
                    Nova Configuração
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando configurações...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Chave (Key)</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Valor (Value)</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {configs.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-12 text-center text-gray-500">
                                        <p className="mb-4">Nenhuma configuração encontrada.</p>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Deseja criar as configurações padrão?')) return;
                                                try {
                                                    await ConfigService.upsert({
                                                        configKey: 'OPENAI_API_TOKEN',
                                                        configValue: 'sk-placeholder'
                                                    });
                                                    loadConfigs();
                                                    addToast('Configurações padrão criadas.');
                                                } catch { addToast('Erro ao criar defaults', 'error') }
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                                        >
                                            Clique aqui para criar configurações padrão
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                configs.map((config) => (
                                    <tr key={config.configKey} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-mono text-sm font-bold text-indigo-600">{config.configKey}</td>
                                        <td className="p-4 font-mono text-sm text-gray-700 bg-gray-50 rounded select-all">{config.configValue}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(config.configKey)}
                                                className="text-gray-400 hover:text-red-600 transition"
                                                title="Remover Configuração"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <BaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Configuração"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Chave (Key)</label>
                        <input
                            autoFocus
                            required
                            className="w-full border rounded-xl p-3 font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="EX: SITE_MAINTENANCE"
                            value={configKey}
                            onChange={e => setConfigKey(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Valor</label>
                        <input
                            required
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="true / false / 123"
                            value={configValue}
                            onChange={e => setConfigValue(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
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
                            <Save size={18} className="mr-2" />
                            Salvar
                        </Button>
                    </div>
                </form>
            </BaseModal>
        </div>
    );
}
