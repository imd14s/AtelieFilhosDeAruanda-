import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Repeat, Package, Percent, Search, Ticket } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { ProductService } from '../../services/ProductService';
import clsx from 'clsx';

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const cleanBase = apiUrl.replace(/\/api$/, '');
    return `${cleanBase}${url}`;
};

export function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [availableProducts, setAvailableProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
            setAvailableProducts(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const planToSave = {
                ...editingPlan,
                isCouponPack: editingPlan.type === 'COUPON'
            };

            if (editingPlan.id) {
                await subscriptionService.updatePlan(editingPlan.id, planToSave);
            } else {
                await subscriptionService.createPlan(planToSave);
            }
            fetchPlans();
            setShowModal(false);
            setEditingPlan(null);
        } catch (error) {
            console.error('Erro ao salvar plano:', error);
            alert('Erro ao salvar plano.');
        }
    };

    const toggleProduct = (product: any) => {
        const products = editingPlan.products || [];
        const exists = products.find((p: any) => p.product?.id === product.id || p.productId === product.id);
        let newProducts;
        if (exists) {
            newProducts = products.filter((p: any) => (p.product?.id || p.productId) !== product.id);
        } else {
            newProducts = [...products, { product, productId: product.id, quantity: 1 }];
        }
        setEditingPlan({ ...editingPlan, products: newProducts });
    };

    const updateProductQuantity = (productId: string, quantity: number) => {
        const newProducts = editingPlan.products.map((p: any) =>
            (p.product?.id || p.productId) === productId ? { ...p, quantity } : p
        );
        setEditingPlan({ ...editingPlan, products: newProducts });
    };

    const toggleFrequency = (freq: string) => {
        const frequencyRules = editingPlan.frequencyRules || [];
        const exists = frequencyRules.find((r: any) => r.frequency === freq);
        let newRules;
        if (exists) {
            newRules = frequencyRules.filter((r: any) => r.frequency !== freq);
        } else {
            newRules = [...frequencyRules, { frequency: freq, discountPercentage: 0 }];
        }
        setEditingPlan({ ...editingPlan, frequencyRules: newRules });
    };

    const updateDiscount = (freq: string, discount: number) => {
        const newRules = editingPlan.frequencyRules.map((r: any) =>
            r.frequency === freq ? { ...r, discountPercentage: discount } : r
        );
        setEditingPlan({ ...editingPlan, frequencyRules: newRules });
    };

    const filteredProducts = availableProducts.filter(ap => {
        const isNotSelected = !(editingPlan?.products || []).some((p: any) => (p.product?.id || p.productId) === ap.id);
        const matchesSearch = ap.name.toLowerCase().includes(searchTerm.toLowerCase());
        return isNotSelected && matchesSearch;
    });

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
                        setEditingPlan({
                            type: 'FIXED',
                            name: '',
                            description: '',
                            active: true,
                            frequencyRules: [],
                            products: [],
                            minProducts: 1,
                            maxProducts: 10,
                            isCouponPack: false,
                            couponBundleCount: 5,
                            couponDiscountPercentage: 10,
                            couponValidityDays: 30
                        });
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
                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={clsx(
                                    "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                    plan.isCouponPack ? "bg-amber-100 text-amber-700" :
                                        plan.type === 'FIXED' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                )}>
                                    {plan.isCouponPack ? 'Venda de Cupons' : plan.type === 'FIXED' ? 'Fixo (Admin)' : 'Personalizado'}
                                </div>
                                {plan.active ? <CheckCircle2 className="text-green-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{plan.description}</p>

                            <div className="space-y-2 mb-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Repeat size={16} />
                                    <span>{plan.frequencyRules?.length || 0} frequências configuradas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {plan.isCouponPack ? <Ticket size={16} /> : <Package size={16} />}
                                    <span>
                                        {plan.isCouponPack
                                            ? `${plan.couponBundleCount} cupons de ${plan.couponDiscountPercentage}%`
                                            : plan.type === 'FIXED' ? `${plan.products?.length || 0} produtos inclusos` : `${plan.minProducts}-${plan.maxProducts} itens p/ kit`
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                                    className="flex-1 flex justify-center items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    <Edit2 size={16} />
                                    Editar
                                </button>
                                <button
                                    onClick={async () => { if (confirm('Excluir plano?')) { await subscriptionService.deletePlan(plan.id); fetchPlans(); } }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-100"
                                >
                                    <Trash2 size={18} />
                                </button>
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

            {showModal && editingPlan && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Configurar Plano de Assinatura</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                    <select
                                        value={editingPlan.type}
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
                                        value={editingPlan.name}
                                        required
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ex: Combo Axé Mensal"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                                <textarea
                                    value={editingPlan.description}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                    placeholder="Explique o que o cliente recebe nesta assinatura..."
                                />
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
                                                value={editingPlan.couponBundleCount}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, couponBundleCount: parseInt(e.target.value) })}
                                                className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-600 uppercase">% Desconto</label>
                                            <input
                                                type="number"
                                                value={editingPlan.couponDiscountPercentage}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, couponDiscountPercentage: parseFloat(e.target.value) })}
                                                className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-amber-600 uppercase">Validade (Dias)</label>
                                            <input
                                                type="number"
                                                value={editingPlan.couponValidityDays}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, couponValidityDays: parseInt(e.target.value) })}
                                                className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-amber-600 italic">* O cliente receberá {editingPlan.couponBundleCount} cupons de {editingPlan.couponDiscountPercentage}% válidos por {editingPlan.couponValidityDays} dias após cada ciclo de pagamento.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Produtos Selecionados</label>
                                        <span className="text-xs text-indigo-600 border border-indigo-100 bg-indigo-50 px-2 py-0.5 rounded-full">Soma do Admin</span>
                                    </div>

                                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                                        {(editingPlan.products || []).map((p: any) => (
                                            <div key={p.product?.id || p.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <img src={getImageUrl(p.product?.media?.[0]?.url || p.product?.imageUrl)} alt="" className="w-10 h-10 rounded object-cover border bg-white" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{p.product?.title || p.product?.name}</p>
                                                        <p className="text-xs text-gray-500">R$ {p.product?.price?.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={p.quantity}
                                                        onChange={(e) => updateProductQuantity(p.product?.id || p.productId, parseInt(e.target.value))}
                                                        className="w-16 border rounded p-1 text-center text-sm"
                                                    />
                                                    <button type="button" onClick={() => toggleProduct(p.product)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                        <Plus size={16} className="rotate-45" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(editingPlan.products || []).length === 0 && (
                                            <div className="text-center py-4 text-gray-400 text-sm border-2 border-dashed rounded-lg">
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
                                        <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto border rounded-xl p-2 bg-white">
                                            {filteredProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => toggleProduct(product)}
                                                    className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg text-left transition text-sm"
                                                >
                                                    <img src={getImageUrl(product.media?.[0]?.url || product.imageUrl)} alt="" className="w-8 h-8 rounded object-cover" />
                                                    <span className="flex-1 truncate">{product.title || product.name}</span>
                                                    <Plus size={14} className="text-indigo-400" />
                                                </button>
                                            ))}
                                            {filteredProducts.length === 0 && (
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
                                        const frequencyRules = editingPlan.frequencyRules || [];
                                        const rule = frequencyRules.find((r: any) => r.frequency === freq.key);
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
                                                        disabled={!rule}
                                                        value={rule?.discountPercentage || 0}
                                                        onChange={(e) => updateDiscount(freq.key, parseFloat(e.target.value))}
                                                        placeholder="Desc."
                                                        className="w-full p-2 text-sm outline-none"
                                                    />
                                                    <span className="bg-gray-50 px-2 py-2 text-xs text-gray-400 font-bold">%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition font-medium">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-100">Salvar Plano</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
