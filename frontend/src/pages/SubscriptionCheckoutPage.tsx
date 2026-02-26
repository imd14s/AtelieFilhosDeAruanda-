import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Package, Clock, ShieldCheck, CheckCircle, Search, Plus, Trash2, Loader2, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import subscriptionService from '../services/subscriptionService';
import { productService } from '../services/productService';
import addressService from '../services/addressService';
import { SubscriptionPlan, Address, Product, User } from '../types';

interface SelectionProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

const SubscriptionCheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user: User | null = userStr ? JSON.parse(userStr) : null;

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    // Form State
    const [selectedFrequency, setSelectedFrequency] = useState<string>('');
    const [selectedProducts, setSelectedProducts] = useState<SelectionProduct[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [userAddresses, setUserAddresses] = useState<Address[]>([]);

    // Product Search State (for CUSTOM kit)
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState<boolean>(false);

    useEffect(() => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('show-alert', { detail: 'Faça login para assinar um plano.' }));
            navigate('/assinaturas');
            return;
        }

        const loadData = async () => {
            if (!id) return;
            try {
                const planData = await subscriptionService.getPlan(id);
                setPlan(planData);

                const params = new URLSearchParams(window.location.search);
                const freqParam = params.get('frequency');

                // Set frequency: query param > first available
                if (freqParam && planData.frequencyRules?.some(r => r.frequency === freqParam)) {
                    setSelectedFrequency(freqParam);
                } else if (planData.frequencyRules?.[0]) {
                    setSelectedFrequency(planData.frequencyRules[0].frequency);
                }

                // If FIXED plan, pre-fill products
                if (planData.type === 'FIXED' && planData.products) {
                    setSelectedProducts(planData.products.map(pp => ({
                        id: pp.product.id || '', // Assumindo que id existe no objeto retornado
                        name: pp.product.name,
                        price: (pp.product as any).price || 0, // Fallback caso price falte na sub-interface
                        quantity: pp.quantity
                    })));
                }

                // Load addresses
                const addresses = await addressService.list(user.id);
                setUserAddresses(addresses);
                const def = addresses.find(a => a.isDefault) || addresses[0];
                if (def) setSelectedAddress(def);

            } catch (err) {
                console.error("Erro ao carregar checkout:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            setSearching(true);
            const timer = setTimeout(async () => {
                try {
                    const results = await productService.getProducts({ search: searchTerm });
                    setSearchResults(results.slice(0, 5));
                } finally {
                    setSearching(false);
                }
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const handleAddProduct = (product: Product) => {
        if (!plan || (plan.maxProducts && selectedProducts.length >= plan.maxProducts)) {
            window.dispatchEvent(new CustomEvent('show-alert', { detail: `Limite máximo de ${plan?.maxProducts} produtos atingido.` }));
            return;
        }
        setSelectedProducts(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
        setSearchTerm('');
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    const calculateTotal = () => {
        if (!plan) return 0;
        const productsTotal = selectedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
        return (plan.basePrice || 0) + productsTotal;
    };

    const handleSubmit = async () => {
        if (!plan || !user) return;

        if (plan.type === 'CUSTOM' && plan.minProducts && selectedProducts.length < plan.minProducts) {
            window.dispatchEvent(new CustomEvent('show-alert', { detail: `Selecione pelo menos ${plan.minProducts} produtos.` }));
            return;
        }
        if (!selectedAddress) {
            window.dispatchEvent(new CustomEvent('show-alert', { detail: 'Selecione um endereço de entrega.' }));
            return;
        }

        setSubmitting(true);
        try {
            await subscriptionService.subscribe(user.id, {
                planId: plan.id,
                frequency: selectedFrequency,
                shippingAddressId: selectedAddress.id,
                items: selectedProducts.map(p => ({ productId: p.id, quantity: p.quantity }))
            });
            setSuccess(true);
        } catch (err) {
            console.error("Erro ao assinar:", err);
            window.dispatchEvent(new CustomEvent('show-alert', { detail: 'Erro ao processar assinatura. Tente novamente.' }));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--azul-profundo)]" size={40} />
        </div>
    );

    if (success && plan) return (
        <div className="min-h-screen bg-[var(--branco-off-white)] flex flex-col items-center justify-center p-4 text-center">
            <SEO title="Assinatura Confirmada" />
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8">
                <CheckCircle size={40} />
            </div>
            <h1 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-4">Assinatura Ativada!</h1>
            <p className="font-lato text-base text-[var(--azul-profundo)]/60 mb-8 max-w-md">
                Parabéns! Sua assinatura do plano <strong>{plan.name}</strong> foi confirmada.
                Você receberá seus produtos em casa a cada {selectedFrequency === 'WEEKLY' ? 'semana' : selectedFrequency === 'BIWEEKLY' ? '15 dias' : 'mês'}.
            </p>
            <Link to="/perfil/assinaturas" className="bg-[var(--azul-profundo)] text-white px-10 py-4 font-lato text-xs uppercase tracking-widest hover:bg-[#0a1e33] transition-all">
                Gerenciar minhas assinaturas
            </Link>
        </div>
    );

    if (!plan) return null;

    return (
        <div className="bg-[var(--branco-off-white)] min-h-screen pb-24">
            <SEO title={`Assinar ${plan.name}`} />
            <div className="max-w-7xl mx-auto px-4 pt-12">
                <Link to="/assinaturas" className="inline-flex items-center gap-2 text-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)] mb-12">
                    <ChevronLeft size={16} />
                    <span className="font-lato text-[10px] uppercase tracking-widest">Voltar para planos</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Configuração */}
                    <div className="flex-[1.5] space-y-12">
                        <section>
                            <h1 className="font-playfair text-3xl text-[var(--azul-profundo)] mb-2">Finalizar Assinatura</h1>
                            <p className="text-gray-500">Configuração do seu plano {plan.name}</p>
                        </section>

                        {/* 1. Produtos */}
                        <section className="bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
                            <h2 className="font-playfair text-xl text-[var(--azul-profundo)] mb-6 flex items-center gap-3">
                                <Package className="text-[var(--dourado-suave)]" />
                                {plan.type === 'FIXED' ? 'Produtos Inclusos' : 'Monte seu Kit'}
                            </h2>

                            {plan.type === 'CUSTOM' && (
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Busque produtos para seu kit..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--dourado-suave)] transition"
                                        />
                                        {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />}
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            {searchResults.map(p => (
                                                <button key={p.id} onClick={() => handleAddProduct(p)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
                                                    <span className="text-sm font-medium">{p.name}</span>
                                                    <Plus size={16} className="text-[var(--dourado-suave)]" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-400">
                                        Selecione de {plan.minProducts} a {plan.maxProducts} itens
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {selectedProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 transition hover:border-[var(--dourado-suave)]/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white border border-gray-100 rounded flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--azul-profundo)]">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.quantity} un. • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</p>
                                            </div>
                                        </div>
                                        {plan.type === 'CUSTOM' && (
                                            <button onClick={() => handleRemoveProduct(p.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                        )}
                                    </div>
                                ))}
                                {selectedProducts.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Nenhum produto selecionado</div>
                                )}
                            </div>
                        </section>

                        {/* 2. Frequência */}
                        <section className="bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
                            <h2 className="font-playfair text-xl text-[var(--azul-profundo)] mb-6 flex items-center gap-3">
                                <Clock className="text-[var(--dourado-suave)]" /> Frequência de Entrega
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {plan.frequencyRules?.map(rule => (
                                    <button
                                        key={rule.frequency}
                                        onClick={() => setSelectedFrequency(rule.frequency)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left group ${selectedFrequency === rule.frequency ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-gray-50 hover:border-gray-200'}`}
                                    >
                                        <p className={`text-sm font-bold ${selectedFrequency === rule.frequency ? 'text-[var(--azul-profundo)]' : 'text-gray-400'}`}>
                                            {rule.frequency === 'WEEKLY' ? 'Semanal' : rule.frequency === 'BIWEEKLY' ? 'Quinzenal' : 'Mensal'}
                                        </p>
                                        {rule.discountPercentage > 0 && (
                                            <p className="text-xs text-green-600 mt-1">-{rule.discountPercentage}% de desconto</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. Endereço */}
                        <section className="bg-white p-8 border border-gray-100 rounded-xl shadow-sm">
                            <h2 className="font-playfair text-xl text-[var(--azul-profundo)] mb-6 flex items-center gap-3">
                                <MapPin className="text-[var(--dourado-suave)]" /> Endereço de Entrega
                            </h2>
                            <div className="space-y-4">
                                {userAddresses.map(addr => (
                                    <button
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${selectedAddress?.id === addr.id ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)]/5' : 'border-gray-50 hover:border-gray-200'}`}
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-[var(--azul-profundo)]">{addr.label || 'Endereço'} {addr.isDefault && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase ml-2">Padrão</span>}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{addr.street}, {addr.number} - {addr.city}</p>
                                        </div>
                                        {selectedAddress?.id === addr.id && <CheckCircle size={18} className="text-[var(--dourado-suave)]" />}
                                    </button>
                                ))}
                                <Link to="/perfil/enderecos" className="inline-block text-xs text-[var(--dourado-suave)] font-bold uppercase tracking-wider hover:opacity-80 transition">+ Gerenciar Endereços</Link>
                            </div>
                        </section>
                    </div>

                    {/* Resumo */}
                    <div className="flex-1 lg:sticky lg:top-32 h-fit">
                        <div className="bg-white p-8 border border-gray-100 rounded-xl shadow-lg space-y-8">
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">Resumo da Assinatura</h2>
                            <div className="space-y-4 border-t border-gray-50 pt-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Base do Plano</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.basePrice || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Produtos ({selectedProducts.length})</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0))}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-[var(--azul-profundo)] pt-4 border-t border-gray-50">
                                    <span>Total Recorrente</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed text-center italic">Este valor será cobrado automaticamente a cada {selectedFrequency === 'WEEKLY' ? 'semana' : selectedFrequency === 'BIWEEKLY' ? '15 dias' : 'mês'}.</p>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                                    <ShieldCheck className="text-green-600 shrink-0" size={20} />
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        Pagamento processado via Mercado Pago. O valor será debitado no cartão cadastrado em sua conta. Você pode cancelar ou pausar a qualquer momento.
                                    </p>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full bg-[var(--azul-profundo)] text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-[#0a1e33] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Assinatura'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCheckoutPage;
