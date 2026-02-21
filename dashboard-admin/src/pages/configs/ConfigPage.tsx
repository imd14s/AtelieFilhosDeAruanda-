import React, { useEffect, useState } from 'react';
import { ConfigService } from '../../services/ConfigService';
import type { SystemConfig } from '../../types/config';
import { Settings, Trash2, Plus, Save } from 'lucide-react';

export function ConfigPage() {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [configKey, setConfigKey] = useState('');
    const [configValue, setConfigValue] = useState('');

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
            setConfigs(configs.filter(c => c.configKey !== keyToDelete));
        } catch (error) {
            alert('Não foi possível excluir esta configuração. Tente novamente.');
            console.error(error);
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ConfigService.upsert({ configKey, configValue });
            await loadConfigs(); // Reload to get potential server-side formatting
            setIsModalOpen(false);
            setConfigKey(''); setConfigValue('');
        } catch (error) {
            alert('Não foi possível salvar. Tente novamente.');
            console.error(error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
                    <p className="text-gray-500">Feature Flags e Variáveis Globais</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={20} />
                    Nova Configuração
                </button>
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
                                                if (!confirm('Deseja criar as configurações padrão (Ex: OPENAI_API_TOKEN)?')) return;
                                                try {
                                                    await ConfigService.upsert({
                                                        configKey: 'OPENAI_API_TOKEN',
                                                        configValue: 'sk-placeholder'
                                                    });
                                                    loadConfigs();
                                                } catch (e) { alert('Erro ao criar defaults') }
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Settings size={20} />Nova Configuração
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Chave (Key)</label>
                                <input autoFocus required className="w-full border rounded p-2 font-mono uppercase" placeholder="EX: SITE_MAINTENANCE" value={configKey} onChange={e => setConfigKey(e.target.value.toUpperCase())} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Valor</label>
                                <input required className="w-full border rounded p-2" placeholder="true / false / 123" value={configValue} onChange={e => setConfigValue(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2">
                                    <Save size={16} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
