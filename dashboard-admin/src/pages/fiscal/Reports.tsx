import React, { useState } from 'react';
import {
    FileText,
    Download,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCcw,
    Calendar,
    Filter,
    Search
} from 'lucide-react';
import ReportService, { GeneratedReport } from '../../services/ReportService';
import { useToast } from '../../components/ui/use-toast';

const Reports: React.FC = () => {
    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    const handleRequestReport = async (type: 'CSV' | 'PDF', period: string) => {
        try {
            setLoading(true);
            const newReport = await ReportService.requestReport(type, period);
            setReports([newReport, ...reports]);
            toast({
                title: "Relatório Solicitado",
                description: `O relatório ${type} para o período ${period} está sendo processado.`,
            });
        } catch {
            toast({
                title: "Erro ao Gerar Relatório",
                description: "Ocorreu um erro ao processar sua solicitação.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        PROCESSING: 'bg-blue-100 text-blue-700 animate-pulse',
        COMPLETED: 'bg-green-100 text-green-700',
        FAILED: 'bg-red-100 text-red-700',
    };

    const statusIcons = {
        PENDING: <Clock className="w-4 h-4" />,
        PROCESSING: <RefreshCcw className="w-4 h-4" />,
        COMPLETED: <CheckCircle className="w-4 h-4" />,
        FAILED: <AlertCircle className="w-4 h-4" />,
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Geração de Relatórios</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Exporte dados financeiros consolidados para auditoria e contabilidade.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleRequestReport('CSV', '30d')}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
                    >
                        <Search className="w-4 h-4" /> Exportar CSV (Contábil)
                    </button>
                    <button
                        onClick={() => handleRequestReport('PDF', '30d')}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
                    >
                        <FileText className="w-4 h-4" /> Gerar PDF Profissional
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Histórico Recente
                            </h2>
                            <button
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => setIsRefreshing(true)}
                            >
                                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-medium uppercase tracking-wider">
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Período</th>
                                        <th className="px-6 py-4">Solicitado em</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                    {reports.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                                Nenhum relatório gerado recentemente.
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${report.reportType === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                        {report.reportType === 'PDF' ? <FileText className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                                                    </div>
                                                    {report.reportType}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 uppercase">{report.period}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    {new Date(report.requestedAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                                                        {statusIcons[report.status]}
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {report.status === 'COMPLETED' ? (
                                                        <a
                                                            href={report.downloadUrl}
                                                            download
                                                            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-end gap-1"
                                                        >
                                                            <Download className="w-4 h-4" /> Baixar
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-300">Indisponível</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 opacity-80" /> Filtros Avançados
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold uppercase opacity-60 mb-2 block">Selecione o Mês</label>
                                <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/40">
                                    <option className="text-slate-900">Março 2024</option>
                                    <option className="text-slate-900">Fevereiro 2024</option>
                                    <option className="text-slate-900">Janeiro 2024</option>
                                </select>
                            </div>
                            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all shadow-md">
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Auditoria Fiscal
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            O sistema gera snapshots automáticos todo dia 01. O período atual ainda está aberto para edições.
                        </p>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                                Último Snapshot: 01/02/2024
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
