import { useState } from 'react';
import { User, Shield, CheckCircle, XCircle, Search, Mail } from 'lucide-react';

export function UsersPage() {
    const [users] = useState([
        { id: 1, name: 'Admin', email: 'admin@atelie.com', role: 'ADMIN', verified: true, active: true },
        { id: 2, name: 'João Silva', email: 'joao@cliente.com', role: 'CUSTOMER', verified: false, active: false }
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>
                    <p className="text-sm text-gray-500 mt-1">Conformidade com LGPD - Detalhes completos do usuário</p>
                </div>
                <div className="flex bg-white rounded-lg border px-3 py-2 items-center space-x-2">
                    <Search size={18} className="text-gray-400" />
                    <input type="text" placeholder="Buscar usuário..." className="outline-none text-sm" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Perfil</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">E-mail</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Conta</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                            <User size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">{u.email}</span>
                                        {u.verified ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-400" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium ${u.active ? 'text-green-600' : 'text-red-500'}`}>
                                        {u.active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                        Detalhes LGPD
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
