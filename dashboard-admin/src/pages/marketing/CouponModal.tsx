import React, { useState } from 'react';
import type { CreateCouponDTO } from '../../types/marketing';
import BaseModal from '../../components/ui/BaseModal';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (coupon: CreateCouponDTO) => Promise<void>;
    initialData?: CreateCouponDTO;
}

export function CouponModal({ isOpen, onClose, onSave, initialData }: CouponModalProps) {
    const [formData, setFormData] = useState<CreateCouponDTO>({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        usageLimit: 100,
        usageLimitPerUser: 1,
        minPurchaseValue: 0
    });
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                code: '',
                type: 'PERCENTAGE',
                value: 0,
                usageLimit: 100,
                usageLimitPerUser: 1,
                minPurchaseValue: 0
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(formData);
            addToast(initialData ? 'Cupom atualizado com sucesso!' : 'Cupom criado com sucesso!', 'success');
            onClose();
        } catch (error) {
            addToast(initialData ? 'Erro ao atualizar cupom' : 'Erro ao criar cupom', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Editar Cupom' : 'Novo Cupom'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                            value={formData.value === 0 ? '' : formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                            placeholder={formData.type === 'PERCENTAGE' ? "10" : "50.00"}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Limite Total</label>
                        <input
                            required
                            type="number"
                            value={formData.usageLimit === 0 ? '' : formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                            placeholder="100"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Limite por Usuário</label>
                        <input
                            required
                            type="number"
                            value={formData.usageLimitPerUser === 0 ? '' : formData.usageLimitPerUser}
                            onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                            placeholder="1"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo da Compra (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.minPurchaseValue === 0 ? '' : formData.minPurchaseValue}
                        onChange={(e) => setFormData({ ...formData, minPurchaseValue: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        placeholder="0.00"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500 italic">Deixe em branco ou digite 0 para ignorar o valor mínimo.</p>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        isLoading={loading}
                        type="submit"
                        variant="primary"
                        className="flex-1"
                    >
                        {initialData ? 'Salvar Alterações' : 'Criar Cupom'}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
}
