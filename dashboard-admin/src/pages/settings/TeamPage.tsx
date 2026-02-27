import { useEffect, useState } from 'react';
import { UserService } from '../../services/UserService';
import type { User } from '../../types/user';
import { UserPlus, Shield, Trash2, Edit } from 'lucide-react';

export function TeamPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ id: '', name: '', email: '', password: '', role: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE' });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAll();
            // Exibe apenas membros da equipe (ADMIN e EMPLOYEE)
            const teamOnly = data.filter(u => u.role === 'ADMIN' || u.role === 'EMPLOYEE');
            setUsers(teamOnly);
        } catch (error) {
            console.error('Erro ao carregar usuários', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setNewUser({ ...user, password: '' } as typeof newUser);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este membro?')) return;
        try {
            await UserService.delete(id);
            loadUsers();
        } catch (error) {
            console.error('Erro ao excluir usuário', error);
            alert('Erro ao excluir usuário.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && newUser.id) {
                await UserService.update(newUser.id, newUser);
            } else {
                await UserService.create(newUser);
            }
            setIsModalOpen(false);
            setNewUser({ id: '', name: '', email: '', password: '', role: 'EMPLOYEE' });
            setIsEditMode(false);
            loadUsers();
        } catch (error) {
            console.error('Erro ao salvar usuário', error);
            alert(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} usuário.`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Equipe & Permissões</h1>
                    <p className="text-gray-500">Gerencie quem tem acesso à loja</p>
                </div>
                <button
                    onClick={() => { setIsEditMode(false); setNewUser({ id: '', name: '', email: '', password: '', role: 'EMPLOYEE' }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
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
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                        Nenhum membro da equipe encontrado.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {user.name?.charAt(0) || '?'}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                <Shield size={12} />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {user.active ? <span className="text-green-600">Ativo</span> : <span className="text-red-500">Inativo</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-gray-400 hover:text-indigo-600 mx-2 transition"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-gray-400 hover:text-red-600 transition"
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Editar Membro' : 'Adicionar Membro'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded p-2"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border rounded p-2"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            {!isEditMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full border rounded p-2"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Função</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}
                                >
                                    <option value="EMPLOYEE">Funcionário</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    {isEditMode ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
