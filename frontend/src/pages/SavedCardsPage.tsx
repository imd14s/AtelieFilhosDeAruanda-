/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Plus, Trash2, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext } from 'react-router-dom';
import cardService from '../services/cardService';
import { useMercadoPago } from '../hooks/useMercadoPago';
import { useAuth } from '../context/AuthContext';
import { User, Card } from '../types';
import { SafeAny } from "../types/safeAny";

interface UserContext {
    user: User | null;
}

const brandLogos: Record<string, string> = {
    visa: '💳 Visa',
    master: '💳 Mastercard',
    amex: '💳 Amex',
    elo: '💳 Elo',
    hipercard: '💳 Hipercard',
};

const SavedCardsPage: React.FC = () => {
    const { user } = useOutletContext<UserContext>();
    const { mp, loading: mpLoading, isConfigured, error: mpError } = useMercadoPago();
    const { refreshCards } = useAuth();
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const cardFormRef = useRef<SafeAny>(null);

    useEffect(() => {
        const userId = user?.id || user?.googleId;
        if (userId) {
            fetchCards();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Inicializa CardForm quando o formulário é exibido e MP está pronto
    useEffect(() => {
        let mounted = true;

        const initCardForm = () => {
            if (showAddForm && mp && isConfigured && !cardFormRef.current) {
                // Aumentado timeout para garantir renderização completa do DOM
                setTimeout(() => {
                    if (!mounted || !showAddForm) return;

                    const container = document.getElementById('cardNumber');
                    if (!container) {
                        console.warn("[SavedCardsPage] Container 'cardNumber' não encontrado no DOM");
                        return;
                    }

                    try {
                        console.log("[SavedCardsPage] Inicializando CardForm...");
                        cardFormRef.current = mp.cardForm({
                            amount: '1.0',
                            iframe: true,
                            form: {
                                id: 'mp-card-form',
                                cardNumber: { id: 'cardNumber', placeholder: '0000 0000 0000 0000' },
                                expirationDate: { id: 'expirationDate', placeholder: 'MM/AA' },
                                securityCode: { id: 'securityCode', placeholder: 'CVV' },
                                cardholderName: { id: 'cardholderName' },
                                identificationType: { id: 'identificationType' },
                                identificationNumber: { id: 'identificationNumber' },
                                issuer: { id: 'issuer' },
                                installments: { id: 'installments' },
                                cardholderEmail: { id: 'cardholderEmail' }
                            },
                            callbacks: {
                                onFormMounted: (error: SafeAny) => {
                                    if (error) {
                                        console.error('Erro ao montar form:', error);
                                        setError('Erro ao carregar campos seguros. Tente recarregar a página.');
                                    } else {
                                        console.log('CardForm montado com sucesso.');
                                    }
                                },
                                onSubmit: async (event: React.FormEvent) => {
                                    event.preventDefault();
                                    setSaving(true);
                                    setError('');

                                    try {
                                        const formData = cardFormRef.current.getCardFormData();
                                        if (formData.token) {
                                            await cardService.saveCard(formData.token);
                                            fetchCards();
                                            refreshCards(); // Sincroniza estado global
                                            setShowAddForm(false);
                                            cardFormRef.current = null;
                                        }
                                    } catch (err: SafeAny) {
                                        setError(err.message || 'Erro ao salvar cartão.');
                                    } finally {
                                        setSaving(false);
                                    }
                                },
                                onError: (errors: SafeAny[]) => {
                                    const errorMsg = errors.find(e => e.message)?.message || 'Verifique os dados do cartão.';
                                    setError(errorMsg);
                                    setSaving(false);
                                }
                            }
                        });
                    } catch (e) {
                        console.error('Erro ao inicializar CardForm:', e);
                    }
                }, 200);
            }
        };

        initCardForm();

        return () => {
            mounted = false;
            if (cardFormRef.current) {
                console.log("[SavedCardsPage] Unmounting... Limpando CardForm");
                cardFormRef.current = null;
            }
        };
    }, [showAddForm, mp, isConfigured]);

    const fetchCards = () => {
        setLoading(true);
        cardService.listCards()
            .then(data => setCards(data))
            .catch(() => setCards([]))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (cardId: string) => {
        if (!confirm('Tem certeza que deseja remover este cartão?')) return;
        try {
            await cardService.deleteCard(cardId);
            setCards(prev => prev.filter(c => c.id !== cardId));
        } catch (err) {
            setError('Erro ao remover cartão.');
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cardFormRef.current) {
            cardFormRef.current.submit();
        }
    };

    if (!user) return null;

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Cartões Salvos" description="Gerencie seus cartões de pagamento salvos." />

            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Cartões Salvos</h1>
                        <p className="text-gray-500 text-sm mt-1">Gerencie seus métodos de pagamento para compras e assinaturas.</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 bg-[var(--azul-profundo)] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#0a1e33] transition-colors"
                    >
                        <Plus size={18} />
                        Adicionar Cartão
                    </button>
                </div>

                {/* Banner de Segurança / Aviso de Configuração */}
                {!isConfigured && !mpLoading ? (
                    <div className="bg-amber-50 rounded-md p-6 mb-8 border border-amber-200 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm text-amber-900 font-bold uppercase tracking-widest mb-1">Atenção: Configuração Pendente</h3>
                            <p className="text-xs text-amber-800/80 leading-relaxed">
                                A integração com o Mercado Pago ainda não foi concluída pelo administrador.
                                O salvamento de novos cartões estará disponível assim que as chaves de API forem configuradas no Dashboard.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-md p-4 mb-6 shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-full shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-800 font-semibold mb-1">Seus dados estão seguros</p>
                            <p className="text-xs text-gray-500">Os cartões são tokenizados pelo Mercado Pago. Nunca armazenamos dados sensíveis do cartão diretamente.</p>
                        </div>
                    </div>
                )}

                {/* Erro */}
                {(error || mpError) && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                        <AlertTriangle size={16} />
                        {error || mpError}
                    </div>
                )}

                {/* Formulário para Adicionar Cartão */}
                {showAddForm && (
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8 mb-6 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-sm font-bold text-[var(--azul-profundo)] mb-6 flex items-center gap-2">
                            <CreditCard size={18} />
                            Novo Cartão de Crédito
                        </h3>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-6 flex items-start gap-3 text-blue-800">
                            <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed">
                                <p className="font-bold mb-1">Tecnologia de Proteção Mercado Pago</p>
                                <p className="opacity-80">
                                    Seus dados são transformados em um "token" codificado.
                                    Isso significa que as informações sensíveis nunca tocam nossos servidores,
                                    garantindo 100% de segurança em sua transação.
                                </p>
                            </div>
                        </div>

                        {mpLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <Loader2 size={32} className="animate-spin mb-2" />
                                <p className="text-xs font-medium uppercase tracking-widest">Carregando Mercado Pago...</p>
                            </div>
                        ) : !isConfigured ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-4 opacity-40" />
                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Os campos seguros serão carregados automaticamente <br /> após a configuração da Chave Pública no Dashboard.</p>
                            </div>
                        ) : (
                            <form id="mp-card-form" onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="hidden" id="cardholderEmail" value={user.email} />

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Número do Cartão</label>
                                        <div id="cardNumber" className="h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus-within:border-[var(--dourado-suave)] transition-colors"></div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Nome do Titular</label>
                                        <input type="text" id="cardholderName" placeholder="Como impresso no cartão" className="w-full h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:border-[var(--dourado-suave)] transition-colors text-sm uppercase" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Vencimento</label>
                                        <div id="expirationDate" className="h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus-within:border-[var(--dourado-suave)] transition-colors"></div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">CVV</label>
                                        <div id="securityCode" className="h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus-within:border-[var(--dourado-suave)] transition-colors"></div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Tipo de Documento</label>
                                        <select id="identificationType" className="w-full h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:border-[var(--dourado-suave)] transition-colors text-sm"></select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Número do Documento</label>
                                        <input type="text" id="identificationNumber" className="w-full h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:border-[var(--dourado-suave)] transition-colors text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Banco Emissor</label>
                                        <select id="issuer" className="w-full h-12 border border-gray-200 rounded-md px-4 py-3 bg-gray-50 focus:outline-none focus:border-[var(--dourado-suave)] transition-colors text-sm"></select>
                                    </div>

                                    {/* Campo técnico exigido pelo SDK (Oculto para o usuário) */}
                                    <div className="hidden" aria-hidden="true">
                                        <select id="installments"></select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        id="mp-form-submit"
                                        disabled={saving}
                                        className="flex-1 bg-[var(--azul-profundo)] text-white px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-[#0a1e33] transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Validando...
                                            </>
                                        ) : (
                                            'Salvar Cartão'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : cards.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-md shadow-sm border border-dashed border-gray-300 p-12 text-center">
                        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum cartão salvo</h3>
                        <p className="text-gray-500 text-sm mb-4">Adicione um cartão para agilizar suas compras e assinaturas recorrentes.</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-sm text-blue-600 font-semibold hover:underline"
                        >
                            + Adicionar meu primeiro cartão
                        </button>
                    </div>
                ) : (
                    /* Lista de Cartões */
                    <div className="space-y-3">
                        {cards.map(card => (
                            <div key={card.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition">
                                <div className="flex items-center gap-4">
                                    {/* Ícone / Brand */}
                                    <div className="w-14 h-10 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                                        {card.payment_method?.id || 'CARD'}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {brandLogos[card.payment_method?.id || ''] || '💳'} •••• •••• •••• {card.last_four_digits || '****'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {card.cardholder?.name || 'Titular'} · Vence {card.expiration_month}/{card.expiration_year}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(card.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                                    title="Remover cartão"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedCardsPage;
