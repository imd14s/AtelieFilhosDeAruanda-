import { useState, useEffect } from 'react';
import { User as UserIcon, CheckCircle, XCircle, Search, Loader2, Mail } from 'lucide-react';
import { UserService } from '../../services/UserService';
import type { User } from '../../types/user';

export function ClientsPage() {
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await UserService.getAll();
                // Filtra apenas usuários com o papel CUSTOMER (clientes vindo do frontend)
                const customerOnly = data.filter(u => u.role === 'CUSTOMER');
                setClients(customerOnly);
            } catch (error) {
                console.error("Erro ao carregar clientes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestão de Clientes</h1>
                    <p className="text-sm text-gray-500 mt-1">Lista de clientes cadastrados via Loja</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <p className="text-sm text-gray-500">Carregando clientes...</p>
                    </div>
                ) : filteredClients.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">E-mail</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Newsletter</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Conta</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data de Cadastro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredClients.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 overflow-hidden">
                                                {c.avatarUrl ? (
                                                    <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={16} />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">{c.email}</span>
                                            {c.active ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {c.subscribedNewsletter ? (
                                                <div className="group relative">
                                                    <Mail size={16} className="text-indigo-600 fill-indigo-100" />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Assinante</span>
                                                </div>
                                            ) : (
                                                <Mail size={16} className="text-gray-200" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium ${c.active ? 'text-green-600' : 'text-red-500'}`}>
                                            {c.active ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        Nenhum cliente encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
