import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Repeat, Package, Percent, Search, Ticket } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { ProductService } from '../../services/ProductService';
import clsx from 'clsx';
import BaseModal from '../../components/ui/BaseModal';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';

const INITIAL_PLAN_STATE = {
    type: 'FIXED',
    name: '',
    description: '',
    detailedDescription: '',
    imageUrl: '',
    active: true,
    frequencyRules: [],
    products: [],
    minProducts: 1,
    maxProducts: 10,
    basePrice: 0,
    isCouponPack: false,
    couponBundleCount: 0,
    couponDiscountPercentage: 0,
    couponValidityDays: 0
};

export function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Record<string, unknown>>(INITIAL_PLAN_STATE as unknown as Record<string, unknown>);
    const [availableProducts, setAvailableProducts] = useState<Record<string, unknown>[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
        fetchProducts();
    }, []);

    const fetchPlans = async () => {
        try {
            const data = await subscriptionService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Erro ao buscar planos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await ProductService.getAll();
            setAvailableProducts(data as unknown as Record<string, unknown>[]);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };
    const handleSave = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            setIsSaving(true);
            const planToSave = {
                ...editingPlan,
                isCouponPack: editingPlan.type === 'COUPON',
                // Ensure numeric fields are not NaN
                basePrice: Number(editingPlan.basePrice) || 0,
                couponBundleCount: Number(editingPlan.couponBundleCount) || 0,
                couponDiscountPercentage: Number(editingPlan.couponDiscountPercentage) || 0,
                couponValidityDays: Number(editingPlan.couponValidityDays) || 0
            };

            if (editingPlan.id) {
                await subscriptionService.updatePlan(editingPlan.id as string, planToSave, imageFile || undefined);
                addToast('Plano atualizado com sucesso!', 'success');
            } else {
                await subscriptionService.createPlan(planToSave, imageFile || undefined);
                addToast('Plano criado com sucesso!', 'success');
            }
            fetchPlans();
            setShowModal(false);
            setEditingPlan(INITIAL_PLAN_STATE);
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            console.error('Erro ao salvar plano:', error);
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            addToast('Erro ao salvar plano: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleProduct = (product: Record<string, unknown>) => {
        const products = (editingPlan.products as Record<string, unknown>[]) || [];
        const exists = products.find((p: Record<string, unknown>) => (p.product as Record<string, unknown>)?.id === product.id || p.productId === product.id);
        let newProducts;
        if (exists) {
            newProducts = products.filter((p: Record<string, unknown>) => ((p.product as Record<string, unknown>)?.id || p.productId) !== product.id);
        } else {
            newProducts = [...products, { product, productId: product.id, quantity: 1 }];
        }
        setEditingPlan({ ...editingPlan, products: newProducts });
    };

    const updateProductQuantity = (productId: string, quantity: number) => {
        const newProducts = (editingPlan.products as Record<string, unknown>[]).map((p: Record<string, unknown>) =>
            ((p.product as Record<string, unknown>)?.id || p.productId) === productId ? { ...p, quantity: Number(quantity) } : p
        );
        setEditingPlan({ ...editingPlan, products: newProducts });
    };

    const toggleFrequency = (freq: string) => {
        const frequencyRules = (editingPlan.frequencyRules as Record<string, unknown>[]) || [];
        const exists = frequencyRules.find((r: Record<string, unknown>) => r.frequency === freq);
        let newRules;
        if (exists) {
            newRules = frequencyRules.filter((r: Record<string, unknown>) => r.frequency !== freq);
        } else {
            newRules = [...frequencyRules, { frequency: freq, discountPercentage: 0 }];
        }
        setEditingPlan({ ...editingPlan, frequencyRules: newRules });
    };

    const updateDiscount = (freq: string, discount: string | number) => {
        const newRules = (editingPlan.frequencyRules as Record<string, unknown>[]).map((r: Record<string, unknown>) =>
            r.frequency === freq ? { ...r, discountPercentage: discount === '' ? 0 : Number(discount) } : r
        );
        setEditingPlan({ ...editingPlan, frequencyRules: newRules });
    };

    const filteredProducts = availableProducts.filter(ap => {
        const isNotSelected = !((editingPlan?.products as Record<string, unknown>[]) || []).some((p: Record<string, unknown>) => ((p.product as Record<string, unknown>)?.id || p.productId) === ap.id);
        const productName = (ap.title as string) || (ap.name as string) || '';
        const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
        return isNotSelected && matchesSearch;
    }).slice(0, 15);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-medium">Sincronizando planos...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assinaturas (Ateliê+)</h1>
                    <p className="text-gray-500">Gerencie seus planos de recorrência e combos exclusivos.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPlan(INITIAL_PLAN_STATE);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={20} />
                    Novo Plano
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id as string} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={clsx(
                                    "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                    plan.isCouponPack ? "bg-amber-100 text-amber-700" :
                                        plan.type === 'FIXED' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                )}>
                                    {plan.isCouponPack ? 'Venda de Cupons' : plan.type === 'FIXED' ? 'Fixo (Admin)' : 'Customizado'}
                                </div>
                                {plan.active ? <CheckCircle2 className="text-green-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name as string}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{plan.description as string}</p>

                            <div className="space-y-2 mb-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Repeat size={16} />
                                    <span>{(plan.frequencyRules as Record<string, unknown>[])?.length || 0} frequências configuradas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {plan.isCouponPack ? <Ticket size={16} /> : <Package size={16} />}
                                    <span>
                                        {plan.isCouponPack
                                            ? `${plan.couponBundleCount || 0} cupons de ${plan.couponDiscountPercentage || 0}%`
                                            : plan.type === 'FIXED' ? `${(plan.products as Record<string, unknown>[])?.length || 0} produtos inclusos` : `${plan.minProducts as number || 1}-${plan.maxProducts as number || 10} itens p/ kit`
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 font-bold text-indigo-600">
                                    <Percent size={16} className="text-gray-400" />
                                    <span>A partir de R$ {(plan.basePrice as number)?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setEditingPlan({
                                            ...INITIAL_PLAN_STATE,
                                            ...plan,
                                            // Ensure nested arrays are cloned
                                            frequencyRules: plan.frequencyRules ? [...(plan.frequencyRules as Record<string, unknown>[])] : [],
                                            products: plan.products ? [...(plan.products as Record<string, unknown>[])] : []
                                        });
                                        setImagePreview(plan.imageUrl ? getImageUrl(plan.imageUrl as string) : null);
                                        setShowModal(true);
                                    }}
                                    variant="secondary"
                                    className="flex-1 py-1"
                                >
                                    <Edit2 size={16} />
                                    Editar
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (confirm('Excluir plano?')) {
                                            await subscriptionService.deletePlan(plan.id as string);
                                            addToast('Plano excluído.', 'success');
                                            fetchPlans();
                                        }
                                    }}
                                    variant="secondary"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                        <Repeat size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum plano criado</h3>
                        <p className="text-gray-500">Comece criando um plano fixo ou de cupons para seus clientes.</p>
                    </div>
                )}
            </div>

            <BaseModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Configurar Plano de Assinatura"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                            <select
                                value={(editingPlan.type as string) || 'FIXED'}
                                onChange={(e) => setEditingPlan({ ...editingPlan, type: e.target.value, isCouponPack: e.target.value === 'COUPON' })}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="FIXED">Fixo (Admin escolhe)</option>
                                <option value="COUPON">Pacote de Cupons (Venda)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                            <input
                                type="text"
                                value={(editingPlan.name as string) || ''}
                                required
                                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ex: Combo Axé Mensal"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Valor (Preço Base)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={(editingPlan.basePrice as number) || ''}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, basePrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                    className="w-full border rounded-lg p-2 pl-9 outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Resumo (Descrição Curta)</label>
                        <textarea
                            value={(editingPlan.description as string) || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                            placeholder="Breve resumo para o card do plano..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Descrição Detalhada</label>
                        <textarea
                            value={(editingPlan.detailedDescription as string) || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, detailedDescription: e.target.value })}
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                            placeholder="Descreva todos os detalhes, benefícios e o que está incluído no plano..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Imagem de Capa</label>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="hidden"
                                    id="plan-image-upload"
                                />
                                <label
                                    htmlFor="plan-image-upload"
                                    className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                                >
                                    <Package className="text-gray-400" size={20} />
                                    <span className="text-sm text-gray-500 font-medium">
                                        {imageFile ? (imageFile.name as string) : 'Selecionar imagem...'}
                                    </span>
                                </label>
                            </div>
                            {(imagePreview || (editingPlan.imageUrl as string)) && (
                                <div className="h-16 w-16 rounded-lg overflow-hidden border bg-gray-50">
                                    <img
                                        src={imagePreview || getImageUrl(editingPlan.imageUrl as string)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-1">* Se não selecionar uma nova imagem, a atual será mantida.</p>
                    </div>

                    {editingPlan.type === 'COUPON' ? (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-4">
                            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                                <Ticket size={18} /> Configuração do Pacote de Cupons
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-amber-600 uppercase">Qtd. Cupons</label>
                                    <input
                                        type="number"
                                        value={(editingPlan.couponBundleCount as number) || ''}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, couponBundleCount: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                        className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-amber-600 uppercase">% Desconto</label>
                                    <input
                                        type="number"
                                        value={(editingPlan.couponDiscountPercentage as number) || ''}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, couponDiscountPercentage: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                        className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-amber-600 uppercase">Validade (Dias)</label>
                                    <input
                                        type="number"
                                        value={(editingPlan.couponValidityDays as number) || ''}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, couponValidityDays: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                        className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-center"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-amber-600 italic">* O cliente receberá {editingPlan.couponBundleCount as number || 0} cupons de {editingPlan.couponDiscountPercentage as number || 0}% válidos por {editingPlan.couponValidityDays as number || 0} dias após cada ciclo de pagamento.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase">Produtos Selecionados</label>
                                <span className="text-xs text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded-full">Soma do Admin</span>
                            </div>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar border rounded-xl p-2 bg-gray-50/50">
                                {((editingPlan.products as Record<string, unknown>[]) || []).map((p: Record<string, unknown>) => {
                                    const product = p.product as Record<string, unknown>;
                                    return (
                                        <div key={(product?.id as string) || (p.productId as string)} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img src={getImageUrl(((product?.media as Record<string, unknown>[])?.[0]?.url as string) || (product?.imageUrl as string))} alt="" className="w-10 h-10 rounded object-cover border bg-white flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{(product?.title as string) || (product?.name as string)}</p>
                                                    <p className="text-xs text-gray-500">R$ {(product?.price as number)?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={(p.quantity as number) || 1}
                                                    onChange={(e) => updateProductQuantity((p.product as Record<string, unknown>)?.id as string || (p.productId as string), Number(e.target.value))}
                                                    className="w-12 border rounded p-1 text-center text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                                <button type="button" onClick={() => toggleProduct(product)} className="text-red-500 hover:bg-red-50 p-1 rounded transition">
                                                    <Plus size={16} className="rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {((editingPlan.products as Record<string, unknown>[]) || []).length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-xs border-2 border-dashed rounded-lg bg-white/50">
                                        Nenhum produto adicionado. Escolha na lista abaixo.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Escolher Produtos</label>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar produto..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 pr-2 py-1 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 w-32 md:w-48"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-1 min-h-[140px] max-h-[180px] overflow-y-auto border rounded-xl p-2 bg-white shadow-inner custom-scrollbar">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id as string}
                                            type="button"
                                            onClick={() => {
                                                toggleProduct(product);
                                                setSearchTerm('');
                                            }}
                                            className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg text-left transition text-sm group"
                                        >
                                            <img src={getImageUrl(((product.media as Record<string, unknown>[])?.[0]?.url as string) || (product.imageUrl as string))} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                            <span className="flex-1 truncate font-medium text-gray-700 group-hover:text-indigo-600">{(product.title as string) || (product.name as string)}</span>
                                            <Plus size={14} className="text-indigo-400 group-hover:scale-110 transition" />
                                        </button>
                                    ))}
                                    {searchTerm.length > 0 && filteredProducts.length === 0 && (
                                        <p className="text-center py-2 text-xs text-gray-400">Nenhum produto encontrado.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Percent size={14} /> Frequências e Descontos
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: 'WEEKLY', label: 'Semanal' },
                                { key: 'BIWEEKLY', label: 'Quinzenal' },
                                { key: 'MONTHLY', label: 'Mensal' }
                            ].map(freq => {
                                const frequencyRules = (editingPlan.frequencyRules as Record<string, unknown>[]) || [];
                                const rule = frequencyRules.find((r: Record<string, unknown>) => r.frequency === freq.key);
                                return (
                                    <div key={freq.key} className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleFrequency(freq.key)}
                                            className={clsx(
                                                "text-[10px] text-left uppercase px-2 py-0.5 rounded-t font-bold transition",
                                                rule ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                                            )}
                                        >
                                            {freq.label}
                                        </button>
                                        <div className={clsx(
                                            "flex items-center border rounded-b overflow-hidden transition",
                                            rule ? "border-indigo-600 ring-1 ring-indigo-600" : "border-gray-100 opacity-50 pointer-events-none"
                                        )}>
                                            <input
                                                type="number"
                                                value={rule ? ((rule.discountPercentage as number) || '') : ''}
                                                onChange={(e) => updateDiscount(freq.key, e.target.value)}
                                                placeholder="0"
                                                className="w-full p-2 text-sm outline-none text-center"
                                            />
                                            <span className="bg-gray-50 px-2 py-2 text-xs text-gray-400 font-bold">%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="button" onClick={() => setShowModal(false)} variant="secondary" className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={isSaving} variant="primary" className="flex-1 shadow-lg shadow-indigo-100">Salvar Plano</Button>
                    </div>
                </form>
            </BaseModal>
        </div>
    );
}
