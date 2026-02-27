/* eslint-disable */
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { MapPin, Plus, Pencil, Trash2, X, Loader2, Home } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext } from 'react-router-dom';
import addressService from '../services/addressService';
import { User, Address } from '../types';

interface UserContext {
    user: User | null;
}

const emptyAddress: Address = {
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
};

const AddressesPage: React.FC = () => {
    const { user } = useOutletContext<UserContext>();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Address>({ ...emptyAddress });
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const userId = user?.id || user?.googleId;
        if (userId) {
            fetchAddresses(userId);
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAddresses = (userId: string) => {
        setLoading(true);
        addressService.list(userId)
            .then(data => setAddresses(data))
            .catch(() => setAddresses([]))
            .finally(() => setLoading(false));
    };

    const handleEdit = (addr: Address) => {
        setEditingId(addr.id || null);
        setFormData({
            label: addr.label || '',
            street: addr.street || '',
            number: addr.number || '',
            complement: addr.complement || '',
            neighborhood: addr.neighborhood || '',
            city: addr.city || '',
            state: addr.state || '',
            zipCode: addr.zipCode || '',
            isDefault: addr.isDefault || false
        });
        setShowForm(true);
        setError('');
    };

    const handleNew = () => {
        setEditingId(null);
        setFormData({ ...emptyAddress });
        setShowForm(true);
        setError('');
    };

    const handleDelete = async (id: string) => {
        const userId = user?.id || user?.googleId;
        if (!userId || !confirm('Tem certeza que deseja remover este endereço?')) return;
        try {
            await addressService.delete(userId, id);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch {
            setError('Erro ao remover endereço.');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userId = user?.id || user?.googleId;
        if (!userId) return;

        if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
            setError('Preencha os campos obrigatórios.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (editingId) {
                await addressService.update(userId, editingId, formData);
            } else {
                await addressService.create(userId, formData);
            }
            setShowForm(false);
            fetchAddresses(userId);
        } catch {
            setError('Erro ao salvar endereço.');
        }
        setSaving(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    if (!user) return null;

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Meus Endereços" description="Gerencie seus endereços de entrega." />

            <div className="max-w-4xl mx-auto px-4 pt-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Endereços</h1>
                        <p className="text-gray-500 text-sm mt-1">Gerencie os endereços de entrega da sua conta.</p>
                    </div>
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 bg-[var(--azul-profundo)] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#0a1e33] transition-colors"
                    >
                        <Plus size={18} /> Novo Endereço
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Formulário */}
                {showForm && (
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <MapPin size={16} /> {editingId ? 'Editar Endereço' : 'Novo Endereço'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="label" value={formData.label} onChange={handleChange} placeholder="Apelido (ex: Casa, Trabalho)" className="col-span-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            <input name="street" value={formData.street} onChange={handleChange} placeholder="Rua / Avenida *" required className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            <input name="number" value={formData.number} onChange={handleChange} placeholder="Número *" required className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            <input name="complement" value={formData.complement} onChange={handleChange} placeholder="Complemento" className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Bairro" className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            <input name="city" value={formData.city} onChange={handleChange} placeholder="Cidade *" required className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="state" value={formData.state} onChange={handleChange} placeholder="UF *" required maxLength={2} className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                <input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="CEP *" required className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <label className="col-span-full flex items-center gap-2 text-sm text-gray-600">
                                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="accent-blue-600" />
                                Definir como endereço padrão
                            </label>
                            <div className="col-span-full flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--azul-profundo)] text-white rounded-md text-sm font-semibold hover:bg-[#0a1e33] disabled:opacity-50">
                                    {saving ? 'Salvando...' : (editingId ? 'Atualizar' : 'Salvar')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de Endereços */}
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin text-blue-500" size={28} />
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-md shadow-sm border border-dashed border-gray-300 p-12 text-center">
                        <Home size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum endereço cadastrado</h3>
                        <p className="text-gray-500 text-sm mb-4">Adicione um endereço para agilizar suas compras.</p>
                        <button onClick={handleNew} className="text-sm text-blue-600 font-semibold hover:underline">
                            + Adicionar meu primeiro endereço
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map(addr => (
                            <div key={addr.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {addr.label || 'Endereço'} {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2 uppercase font-bold">Padrão</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {addr.street}, {addr.number} {addr.complement ? `- ${addr.complement}` : ''} · {addr.neighborhood} · {addr.city}/{addr.state} · CEP: {addr.zipCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(addr)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition" title="Editar">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => addr.id && handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition" title="Remover">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressesPage;
