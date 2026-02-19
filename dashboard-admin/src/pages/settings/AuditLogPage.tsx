import { useEffect, useState } from 'react';
import { AuditService } from '../../services/AuditService';
import type { AuditLog } from '../../types/audit';

export function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');

    useEffect(() => {
        loadLogs();
    }, [filterAction]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await AuditService.getAll({
                action: filterAction || undefined
            });
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Auditoria (Logs)</h1>
                    <p className="text-gray-500">Histórico de ações e segurança (Retenção 90 dias)</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="p-2 border rounded-lg bg-white text-sm"
                    >
                        <option value="">Todas as Ações</option>
                        <option value="CREATE">Criar</option>
                        <option value="UPDATE">Atualizar</option>
                        <option value="DELETE">Deletar</option>
                        <option value="LOGIN">Login</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando logs...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Ação</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Recurso</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Detalhes</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Autor</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition text-sm">
                                    <td className="p-4 font-bold text-gray-700">
                                        {log.action}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                            {log.resource}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{log.details}</td>
                                    <td className="p-4 text-gray-800">{log.performedBy.name}</td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
