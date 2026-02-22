import React, { useEffect, useState } from 'react';
import { CategoryService } from '../../services/CategoryService';
import type { Category } from '../../types/category';
import { Plus, Trash2, Tag } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [active, setActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { addToast } = useToast();

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
        const confirmed = window.confirm('Tem certeza que deseja excluir esta categoria?');
        if (!confirmed) return;

        setDeletingId(id);
        try {
            await CategoryService.delete(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            addToast('Categoria excluída com sucesso!', 'success');
        } catch (error) {
            addToast('Erro ao excluir categoria. Verifique se não há produtos associados.', 'error');
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await CategoryService.create({ name, active });
            await loadCategories();
            addToast('Categoria criada com sucesso!', 'success');
            setIsModalOpen(false);
            setName('');
            setActive(true);
        } catch (error) {
            addToast('Erro ao criar categoria.', 'error');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
                    <p className="text-gray-500">Gerencie as categorias de produtos</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                >
                    <Plus size={20} />
                    Nova Categoria
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <Spinner size={32} className="text-indigo-600" />
                        <p className="text-gray-500 text-sm">Carregando categorias...</p>
                    </div>
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
                                            {deletingId === cat.id ? (
                                                <Spinner size={18} className="text-red-600 ml-auto" />
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
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
                                <Button type="button" onClick={() => setIsModalOpen(false)} variant="ghost">
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={isSaving} variant="primary">
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
