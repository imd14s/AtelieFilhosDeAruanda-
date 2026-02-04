import { useEffect, useState } from 'react';
import { UserService } from '../../services/UserService';
import type { User } from '../../types/user';
import { UserPlus, Shield, Trash2, Edit } from 'lucide-react';

export function TeamPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const data = await UserService.getAll();
        setUsers(data);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Equipe & Permissões</h1>
                    <p className="text-gray-500">Gerencie quem tem acesso à loja</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    <UserPlus size={20} />
                    Convidar Membro
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando equipe...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Nome</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Função</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Último Acesso</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${user.role === 'MASTER' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'STORE_ADMIN' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            <Shield size={12} />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-400 hover:text-indigo-600 mx-2 transition">
                                            <Edit size={18} />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-600 transition">
                                            <Trash2 size={18} />
                                        </button>
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
