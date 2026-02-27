import { useEffect, useState } from 'react';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';
import { MarketingService } from '../../services/MarketingService';
import type { Coupon, CreateCouponDTO } from '../../types/marketing';
import { CouponModal } from './CouponModal';

export function CouponList() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const data = await MarketingService.getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Erro ao carregar cupons', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setSelectedCoupon(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleSave = async (dto: CreateCouponDTO) => {
        if (selectedCoupon) {
            await MarketingService.updateCoupon(selectedCoupon.id, dto);
        } else {
            await MarketingService.createCoupon(dto);
        }
        await loadCoupons();
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await MarketingService.toggleCoupon(id, !currentStatus);
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
        } catch {
            alert('Erro ao alterar status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este cupom?')) return;
        try {
            await MarketingService.deleteCoupon(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch {
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cupons de Desconto</h1>
                    <p className="text-gray-500">Crie campanhas promocionais</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={20} />
                    Criar Cupom
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Carregando cupons...</div>
                ) : coupons.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <Ticket size={48} className="mb-4 text-gray-200" />
                        <p>Nenhum cupom ativo no momento.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Código</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Desconto</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Usos</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                        Nenhum cupom cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-mono font-bold text-indigo-700">{coupon.code}</td>
                                        <td className="p-4 text-gray-700">
                                            {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => handleToggle(coupon.id, coupon.active)} className="text-indigo-600">
                                                {coupon.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-300" />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(coupon)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 transition"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={selectedCoupon || undefined}
            />
        </div>
    );
}
