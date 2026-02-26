import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Clock, Package, CheckCircle, Loader2, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import SEO from '../components/SEO';
import subscriptionService from '../services/subscriptionService';
import { authService } from '../services/authService';
import { SubscriptionPlan } from '../types';

const SubscriptionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedFrequency, setSelectedFrequency] = useState<string>('');

    useEffect(() => {
        const loadPlan = async () => {
            if (!id) return;
            try {
                const data = await subscriptionService.getPlan(id);
                setPlan(data);
                if (data.frequencyRules && data.frequencyRules.length > 0) {
                    setSelectedFrequency(data.frequencyRules[0]?.frequency || '');
                }
            } catch (err) {
                console.error('Erro ao carregar detalhes do plano:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPlan();
    }, [id]);

    const handleSubscribeClick = () => {
        if (!authService.isAuthenticated()) {
            window.dispatchEvent(new CustomEvent('open-auth-modal'));
            return;
        }
        navigate(`/assinar/${id}?frequency=${selectedFrequency}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[var(--azul-profundo)]" size={40} />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
                <h1 className="text-2xl font-playfair mb-4">Plano não encontrado</h1>
                <Link to="/assinaturas" className="text-[var(--dourado-suave)] hover:underline">Voltar para assinaturas</Link>
            </div>
        );
    }

    const frequencyLabel = (freq: string) => {
        const labels: Record<string, string> = { WEEKLY: 'Semanal', BIWEEKLY: 'Quinzenal', MONTHLY: 'Mensal' };
        return labels[freq] || freq;
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={`${plan.name} - Ateliê+`}
                description={plan.description}
                image={plan.imageUrl}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
                {/* Back Button */}
                <div className="mb-8">
                    <Link
                        to="/assinaturas"
                        className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-[var(--azul-profundo)] transition-all"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar para planos
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
                    {/* Visual Side */}
                    <div className="flex-1">
                        <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group">
                            {plan.imageUrl ? (
                                <img
                                    src={plan.imageUrl}
                                    alt={plan.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--azul-profundo)] to-[#1a3a5c]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                            <div className="absolute top-6 left-6">
                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 
                                    ${plan.type === 'CUSTOM' ? 'bg-purple-600/40 text-purple-100' : 'bg-[var(--dourado-ancestral)]/40 text-[var(--azul-profundo)]'}
                                `}>
                                    <Sparkles size={12} />
                                    {plan.type === 'CUSTOM' ? 'Kit Personalizado' : 'Plano Fixo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Extra Info Icons */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <ShieldCheck size={20} className="mx-auto mb-2 text-[var(--dourado-ancestral)]" />
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Seguro</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <Clock size={20} className="mx-auto mb-2 text-[var(--dourado-ancestral)]" />
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Pausável</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <Heart size={20} className="mx-auto mb-2 text-[var(--dourado-ancestral)]" />
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Exclusivo</span>
                        </div>
                    </div>
                </div>

                {/* Info Side */}
                <div className="flex-1 flex flex-col pt-4 lg:pt-0">
                    <div className="space-y-8">
                        <div>
                            <h1 className="font-playfair text-4xl md:text-5xl text-[var(--azul-profundo)] mb-4 font-bold leading-tight">
                                {plan.name}
                            </h1>
                            <p className="text-gray-500 text-lg leading-relaxed">
                                {plan.description}
                            </p>
                        </div>

                        {/* Price / Base Price Component */}
                        <div className="py-6 border-y border-gray-100">
                            <span className="text-xs uppercase tracking-widest text-gray-400 block mb-2">Base do Plano</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-[var(--azul-profundo)] font-lato">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.basePrice || plan.price || 0)}
                                </span>
                                <span className="text-gray-400 text-sm font-lato">/ ciclo de entrega</span>
                            </div>
                        </div>

                        {/* Frequency Selection */}
                        <div className="space-y-4">
                            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold block">Escolha a Frequência</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {plan.frequencyRules?.map(rule => (
                                    <button
                                        key={rule.frequency}
                                        onClick={() => setSelectedFrequency(rule.frequency)}
                                        className={`relative p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-1 
                                                ${selectedFrequency === rule.frequency
                                                ? 'border-[var(--azul-profundo)] bg-[var(--azul-profundo)]/5 ring-1 ring-[var(--azul-profundo)]'
                                                : 'border-gray-100 hover:border-gray-300'}
                                            `}
                                    >
                                        <span className={`text-sm font-bold ${selectedFrequency === rule.frequency ? 'text-[var(--azul-profundo)]' : 'text-gray-500'}`}>
                                            {frequencyLabel(rule.frequency)}
                                        </span>
                                        {rule.discountPercentage > 0 && (
                                            <span className="text-[10px] text-green-600 font-bold font-lato animate-fade-in group-hover:scale-105 transition-transform">
                                                -{rule.discountPercentage}% OFF
                                            </span>
                                        )}
                                        {selectedFrequency === rule.frequency && (
                                            <div className="absolute top-2 right-2 text-[var(--azul-profundo)]">
                                                <CheckCircle size={14} fill="currentColor" className="text-white fill-[var(--azul-profundo)]" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="pt-6 space-y-4">
                            <button
                                onClick={handleSubscribeClick}
                                className="w-full group relative overflow-hidden bg-[var(--azul-profundo)] text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 hover:bg-[#0a1e33] shadow-xl shadow-blue-900/10 active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <ShoppingBag size={20} />
                                    <span>Quero este plano</span>
                                </div>
                            </button>

                            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                                Ao assinar, você concorda com nossos <Link to="/termos" className="underline hover:text-[var(--azul-profundo)]">termos de uso</Link>.
                                Cancele ou pause a qualquer momento sem taxas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Detailed Description & Included Items */}
            <div className="mt-24 pt-16 border-t border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="font-playfair text-3xl font-bold text-[var(--azul-profundo)] mb-8 flex items-center gap-4">
                                <div className="h-1 w-12 bg-[var(--dourado-ancestral)] rounded-full" />
                                Sobre este Plano
                            </h2>
                            <div className="prose prose-lg prose-slate max-w-none font-lato text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {plan.detailedDescription || plan.description}
                            </div>
                        </section>

                        {plan.type === 'FIXED' && plan.products && plan.products.length > 0 && (
                            <section>
                                <h3 className="font-playfair text-2xl font-bold text-[var(--azul-profundo)] mb-8">O que você vai receber</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {plan.products.map((pp, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:border-[var(--dourado-ancestral)] transition-all">
                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[var(--dourado-ancestral)] border border-gray-100 group-hover:bg-[var(--dourado-ancestral)] group-hover:text-white transition-colors">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--azul-profundo)] text-sm">{pp.product?.name}</p>
                                                <p className="text-xs text-gray-500">Quantidade: {pp.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {plan.type === 'CUSTOM' && (
                            <section className="p-8 bg-purple-50 rounded-2xl border border-purple-100">
                                <h3 className="font-playfair text-2xl font-bold text-purple-900 mb-4">Monte seu Kit Sagrado</h3>
                                <p className="text-purple-800/70 mb-0">
                                    Este é um plano personalizado onde você poderá escolher de {plan.minProducts} a {plan.maxProducts} produtos do nosso catálogo para receber na frequência desejada.
                                    O valor final será calculado com base nos itens selecionados + a taxa base do plano.
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Side Benefits Column */}
                    <div className="space-y-8">
                        <div className="bg-[#0f2A44] text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={80} />
                            </div>
                            <h3 className="font-playfair text-2xl font-bold mb-6 relative z-10 text-[var(--dourado-ancestral)]">Vantagens Ateliê+</h3>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    'Até 20% de desconto real',
                                    'Brindes exclusivos em todas as caixas',
                                    'Prioridade em lançamentos',
                                    'Frete inteligente com tarifa fixa',
                                    'Acesso a conteúdos exclusivos'
                                ].map((benefit, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                                        <CheckCircle size={16} className="text-[var(--dourado-ancestral)] shrink-0 mt-0.5" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDetailPage;
