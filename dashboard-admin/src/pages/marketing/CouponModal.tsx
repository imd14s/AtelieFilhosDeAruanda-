import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateCouponDTO } from '../../types/marketing';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (coupon: CreateCouponDTO) => Promise<void>;
}

export function CouponModal({ isOpen, onClose, onSave }: CouponModalProps) {
    const [formData, setFormData] = useState<CreateCouponDTO>({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        usageLimit: 100
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            alert('Erro ao criar cupom');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Novo Cupom</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cupom</label>
                        <input
                            required
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="Ex: VERAS25"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="PERCENTAGE">Porcentagem (%)</option>
                                <option value="FIXED">Valor Fixo (R$)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.type === 'PERCENTAGE' ? 'Porcentagem (%)' : 'Valor (R$)'}
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Uso</label>
                        <input
                            required
                            type="number"
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Criando...' : 'Criar Cupom'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
