import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Tag, Clock, Ticket, ChevronRight, Gift } from 'lucide-react';
import marketingService from '../services/marketingService';

const BenefitsPage = () => {
    const { user } = useOutletContext();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                // Enviar o ID do usuário para pegar cupons exclusivos + públicos
                const data = await marketingService.getAvailableCoupons(user.id);
                setCoupons(data);
            } catch (err) {
                console.error("Erro ao buscar cupons:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchCoupons();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cupons e Benefícios</h1>
                    <p className="text-gray-500 text-sm mt-1">Aproveite seus descontos exclusivos do Ateliê.</p>
                </div>

            </div>

            {coupons.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum cupom disponível</h3>
                    <p className="text-gray-500 mt-2">Fique atento à nossa newsletter para receber novos presentes!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group"
                        >
                            <div className="flex">
                                {/* Lado Esquerdo (Destaque) */}
                                <div className="w-24 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-2 text-white shrink-0">
                                    <span className="text-xs font-bold uppercase tracking-tighter opacity-80">DESCONTO</span>
                                    <div className="text-2xl font-bold leading-tight">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `R$${coupon.value}`}
                                    </div>
                                </div>

                                {/* Lado Direito (Info) */}
                                <div className="flex-1 p-4 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                            {coupon.active ? 'Ativo' : 'Indisponível'}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 text-lg mb-1 tracking-tight">{coupon.code}</h4>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock size={12} />
                                            <span>Expira em: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'Sem Expiração'}</span>
                                        </div>
                                        {coupon.minPurchaseValue > 0 && (
                                            <div className="text-[10px] text-gray-400">
                                                *Válido para compras acima de R$ {coupon.minPurchaseValue}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(coupon.code);
                                            alert("Código copiado!");
                                        }}
                                        className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-2"
                                    >
                                        COPIAR CÓDIGO
                                        <ChevronRight size={14} />
                                    </button>

                                    {/* Decorativo (Círculos laterais de ticket) */}
                                    <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-[#ebebeb] -translate-y-1/2 border-r border-gray-100"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Seção Informativa de Assinatura */}
            <div className="bg-gradient-to-r from-[var(--azul-profundo)] to-blue-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                <div className="relative z-10 max-w-lg">
                    <h3 className="text-xl font-playfair mb-2">Seja um Assinante VIP</h3>
                    <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                        Assine nosso Kit Mensal e receba mensalmente guias, velas e ervas exclusivas, além de cupons fixos de 10% em todas as compras.
                    </p>
                    <Link to="/assinaturas" className="inline-block bg-[var(--dourado-suave)] hover:bg-yellow-600 text-[var(--azul-profundo)] px-6 py-2 rounded-full text-xs font-bold transition-transform group-hover:scale-105">
                        CONHECER ASSINATURAS
                    </Link>
                </div>
                <Gift className="absolute -right-8 -bottom-8 text-white/10 w-48 h-48 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
        </div>
    );
};

export default BenefitsPage;
