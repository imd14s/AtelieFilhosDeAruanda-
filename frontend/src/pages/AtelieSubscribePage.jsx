import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Package, ShieldCheck, Percent, ChevronRight, Sparkles, Heart, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import subscriptionService from '../services/subscriptionService';

const AtelieSubscribePage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        subscriptionService.getPlans()
            .then(data => setPlans(data.filter(p => p.active)))
            .catch(err => console.error('Erro ao buscar planos:', err))
            .finally(() => setLoading(false));
    }, []);

    const fixedPlans = plans.filter(p => p.type === 'FIXED');
    const customPlans = plans.filter(p => p.type === 'CUSTOM');

    const frequencyLabel = (freq) => {
        const labels = { WEEKLY: 'Semanal', BIWEEKLY: 'Quinzenal', MONTHLY: 'Mensal' };
        return labels[freq] || freq;
    };

    return (
        <div className="font-lato">
            <SEO
                title="Ateliê+ Assinaturas"
                description="Receba seus produtos do Ateliê Filhos de Aruanda de forma recorrente com descontos exclusivos."
            />

            {/* Hero */}
            <section className="relative bg-gradient-to-br from-[var(--azul-profundo)] via-[#1a3a5c] to-[var(--azul-profundo)] text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,162,77,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201,162,77,0.2) 0%, transparent 50%)'
                }} />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm tracking-wider uppercase">
                        <Sparkles size={14} className="text-[var(--dourado-ancestral)]" />
                        Ateliê+
                    </div>
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6 leading-tight">
                        Receba axé sem
                        <span className="text-[var(--dourado-ancestral)]"> preocupação</span>
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                        Escolha seu plano de assinatura e receba produtos sagrados do Ateliê na frequência ideal para você, com descontos exclusivos.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">
                        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-[var(--dourado-ancestral)]" /> Cancele quando quiser</div>
                        <div className="flex items-center gap-2"><Percent size={18} className="text-[var(--dourado-ancestral)]" /> Descontos exclusivos</div>
                        <div className="flex items-center gap-2"><Heart size={18} className="text-[var(--dourado-ancestral)]" /> Produtos selecionados</div>
                    </div>
                </div>
            </section>

            {/* Como Funciona */}
            <section className="py-16 px-4 bg-[var(--branco-off-white)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-playfair font-bold text-center text-[var(--azul-profundo)] mb-12">Como Funciona</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Package size={28} />, title: 'Escolha seu plano', desc: 'Combo fixo com tudo incluso ou monte seu kit personalizado.' },
                            { icon: <Clock size={28} />, title: 'Defina a frequência', desc: 'Semanal, quinzenal ou mensal — na medida dos seus rituais.' },
                            { icon: <Repeat size={28} />, title: 'Receba em casa', desc: 'Entrega automática com desconto exclusivo para assinantes.' }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-14 h-14 mx-auto mb-4 bg-[var(--azul-profundo)] text-[var(--dourado-ancestral)] rounded-full flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <h3 className="font-bold text-[var(--azul-profundo)] mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Planos */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-playfair font-bold text-center text-[var(--azul-profundo)] mb-2">Nossos Planos</h2>
                    <p className="text-center text-gray-500 mb-12 text-sm">Escolha entre kits prontos ou monte o seu personalizado.</p>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--azul-profundo)]" />
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg font-medium mb-2">Em breve!</p>
                            <p className="text-sm">Estamos preparando planos incríveis para você.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Planos Fixos */}
                            {fixedPlans.length > 0 && (
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--dourado-ancestral)] font-bold mb-6 text-center">
                                        🎁 Combos Prontos
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {fixedPlans.map(plan => (
                                            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                                                <div className="bg-gradient-to-r from-[var(--azul-profundo)] to-[#1a3a5c] p-5">
                                                    <span className="text-[10px] uppercase tracking-wider bg-[var(--dourado-ancestral)] text-[var(--azul-profundo)] px-2 py-0.5 rounded-full font-bold">
                                                        Combo Fixo
                                                    </span>
                                                    <h4 className="text-lg font-bold text-white mt-3">{plan.name}</h4>
                                                    <p className="text-sm text-white/70 line-clamp-2 mt-1">{plan.description}</p>
                                                </div>
                                                <div className="p-5">
                                                    {plan.products?.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Incluso no combo</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {plan.products.map((pp, i) => (
                                                                    <span key={i} className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 text-gray-700">
                                                                        {pp.product?.name} {pp.quantity > 1 && `(x${pp.quantity})`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {plan.frequencyRules?.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Frequências</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {plan.frequencyRules.map((r, i) => (
                                                                    <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1 font-medium">
                                                                        {frequencyLabel(r.frequency)} {r.discountPercentage > 0 && `(-${r.discountPercentage}%)`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Link to={`/assinar/${plan.id}`} className="w-full block text-center bg-[var(--azul-profundo)] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#0a1e33] transition group-hover:shadow-md">
                                                        Quero esse combo <ChevronRight size={14} className="inline" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Planos Custom */}
                            {customPlans.length > 0 && (
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--dourado-ancestral)] font-bold mb-6 text-center">
                                        🎨 Monte Seu Kit
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {customPlans.map(plan => (
                                            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                                                <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-5">
                                                    <span className="text-[10px] uppercase tracking-wider bg-purple-300 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                                                        Customizado
                                                    </span>
                                                    <h4 className="text-lg font-bold text-white mt-3">{plan.name}</h4>
                                                    <p className="text-sm text-white/70 line-clamp-2 mt-1">{plan.description}</p>
                                                </div>
                                                <div className="p-5">
                                                    <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                                                            {plan.minProducts} a {plan.maxProducts} itens
                                                        </span>
                                                        <span className="text-gray-400">Você escolhe o que vai no kit</span>
                                                    </div>
                                                    {plan.frequencyRules?.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {plan.frequencyRules.map((r, i) => (
                                                                    <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1 font-medium">
                                                                        {frequencyLabel(r.frequency)} {r.discountPercentage > 0 && `(-${r.discountPercentage}%)`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Link to={`/assinar/${plan.id}`} className="w-full block text-center bg-purple-700 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-purple-800 transition group-hover:shadow-md">
                                                        Montar meu kit <ChevronRight size={14} className="inline" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 px-4 bg-[var(--azul-profundo)] text-white text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-playfair font-bold mb-4">Já é assinante?</h2>
                    <p className="text-white/70 mb-6 text-sm">Gerencie suas entregas, pause ou altere sua assinatura a qualquer momento.</p>
                    <Link to="/perfil/assinaturas" className="inline-flex items-center gap-2 bg-[var(--dourado-ancestral)] text-[var(--azul-profundo)] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#d4a84f] transition">
                        Minhas Assinaturas <ChevronRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AtelieSubscribePage;
