import React, { useEffect, useState } from 'react';
import { CategoryService } from '../../services/CategoryService';
import type { Category } from '../../types/category';
import { Plus, Trash2, Tag } from 'lucide-react';

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [active, setActive] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Erro ao carregar categorias', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Simple window.confirm for now, but ensure it blocks
        const confirmed = window.confirm('Tem certeza que deseja excluir esta categoria?');
        if (!confirmed) return;

        try {
            await CategoryService.delete(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert('Erro ao excluir categoria. Verifique se não há produtos associados.');
            console.error(error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await CategoryService.create({ name, active });
            await loadCategories();
            setIsModalOpen(false);
            setName('');
            setActive(true);
        } catch (error) {
            alert('Erro ao criar categoria.');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
                    <p className="text-gray-500">Gerencie as categorias de produtos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={20} />
                    Nova Categoria
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.length === 0 ? (
                                <tr><td colSpan={3} className="p-6 text-center text-gray-500">Nenhuma categoria encontrada.</td></tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-800">{cat.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${cat.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {cat.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="text-gray-400 hover:text-red-600 transition"
                                                title="Excluir"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Tag size={20} />Nova Categoria
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input autoFocus required className="w-full border rounded p-2" placeholder="Ex: Roupas" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} className="rounded text-indigo-600" />
                                <label htmlFor="active" className="text-sm font-medium text-gray-700">Ativa</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
