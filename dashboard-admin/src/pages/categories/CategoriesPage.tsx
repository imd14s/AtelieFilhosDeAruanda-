import React, { useEffect, useState } from 'react';
import { CategoryService } from '../../services/CategoryService';
import type { Category } from '../../types/category';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import BaseModal from '../../components/ui/BaseModal';
import Skeleton from '../../components/ui/Skeleton';

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ... existing state
    const [name, setName] = useState('');
    const [active, setActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await CategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Erro ao carregar categorias', error);
        } finally {
            setLoading(false);
        }
    };
    // ... deleting/saving logic
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
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" variant="text" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" variant="rect" /></td>
                                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" variant="circle" /></td>
                                </tr>
                            ))
                        ) : categories.length === 0 ? (
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
            </div>

            <BaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Categoria"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input autoFocus required className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: Roupas" value={name} onChange={e => setName(e.target.value)} />
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
            </BaseModal>
        </div>
    );
}
