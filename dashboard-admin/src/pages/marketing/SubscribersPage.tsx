import { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, Clock, Search } from 'lucide-react';
import { api } from '../../api/axios';

export function SubscribersPage() {
    interface Subscriber {
        id: string;
        email: string;
        emailVerified: boolean;
        active: boolean;
        subscribedAt: string;
    }

    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/newsletter/subscribers');
            setSubscribers(response.data);
        } catch (error) {
            console.error('Erro ao buscar inscritos', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este inscrito?')) return;
        try {
            await api.delete(`/newsletter/subscribers/${id}`);
            setSubscribers(subscribers.filter(s => s.id !== id));
        } catch (error) {
            console.error('Erro ao remover inscrito', error);
            alert('Erro ao remover inscrito.');
        }
    };

    const filteredSubscribers = subscribers.filter(sub =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Assinantes da Newsletter</h1>
                <div className="flex bg-white rounded-lg border px-3 py-2 items-center space-x-2">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar assinante..."
                        className="outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Carregando inscritos...</div>
                ) : (
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
                            {filteredSubscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Nenhum inscrito encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscribers.map(sub => (
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {sub.emailVerified ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                                {sub.emailVerified ? 'Confirmado' : 'Pendente'}
                                            </span>
                                            {!sub.active && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(sub.subscribedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="text-red-500 hover:text-red-700 transition"
                                                title="Remover"
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
        </div>
    );
}
