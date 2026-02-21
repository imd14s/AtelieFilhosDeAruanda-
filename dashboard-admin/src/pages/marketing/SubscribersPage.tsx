import { useState } from 'react';
import { Mail, Trash2, CheckCircle, Clock, Search } from 'lucide-react';

export function SubscribersPage() {
    const [subscribers] = useState([
        { id: 1, email: 'exemplo@confirmado.com', status: 'VERIFIED', date: '2024-02-21' },
        { id: 2, email: 'pendente@gmail.com', status: 'PENDING', date: '2024-02-22' }
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Assinantes da Newsletter</h1>
                <div className="flex bg-white rounded-lg border px-3 py-2 items-center space-x-2">
                    <Search size={18} className="text-gray-400" />
                    <input type="text" placeholder="Buscar assinante..." className="outline-none text-sm" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">E-mail</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {subscribers.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                            <Mail size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {sub.status === 'VERIFIED' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                        {sub.status === 'VERIFIED' ? 'Confirmado' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{sub.date}</td>
                                <td className="px-6 py-4">
                                    <button className="text-red-500 hover:text-red-700 transition" title="Remover">
                                        <Trash2 size={18} />
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
