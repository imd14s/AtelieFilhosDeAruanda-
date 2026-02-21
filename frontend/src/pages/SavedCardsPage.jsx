import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext } from 'react-router-dom';
import cardService from '../services/cardService';

const brandLogos = {
    visa: '💳 Visa',
    master: '💳 Mastercard',
    amex: '💳 Amex',
    elo: '💳 Elo',
    hipercard: '💳 Hipercard',
};

const SavedCardsPage = () => {
    const { user } = useOutletContext();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.id) fetchCards();
    }, [user]);

    const fetchCards = () => {
        setLoading(true);
        cardService.listCards()
            .then(data => setCards(data))
            .catch(() => setCards([]))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (cardId) => {
        if (!confirm('Tem certeza que deseja remover este cartão?')) return;
        try {
            await cardService.deleteCard(cardId);
            setCards(prev => prev.filter(c => c.id !== cardId));
        } catch (err) {
            setError('Erro ao remover cartão.');
        }
    };

    const handleAddCard = async () => {
        setError('');
        setSaving(true);

        try {
            // MercadoPago.js SDK gera o card_token no frontend
            // Verifica se o SDK está carregado
            if (!window.MercadoPago) {
                setError('SDK do Mercado Pago não carregado. Verifique a configuração.');
                setSaving(false);
                return;
            }

            const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'pt-BR' });
            const cardForm = mp.cardForm({
                amount: '100',
                iframe: false,
                form: {
                    id: 'mp-card-form',
                    cardNumber: { id: 'mp-card-number' },
                    expirationDate: { id: 'mp-expiration-date' },
                    securityCode: { id: 'mp-security-code' },
                    cardholderName: { id: 'mp-cardholder-name' },
                    identificationType: { id: 'mp-identification-type' },
                    identificationNumber: { id: 'mp-identification-number' },
                },
                callbacks: {
                    onFormMounted: () => { },
                    onSubmit: async (event) => {
                        event.preventDefault();
                        const { token } = cardForm.getCardFormData();
                        if (token) {
                            await cardService.saveCard(token);
                            fetchCards();
                            setShowAddForm(false);
                        }
                    },
                    onError: (errors) => {
                        setError('Erro na validação do cartão.');
                        console.error(errors);
                    }
                }
            });
        } catch (err) {
            // Fallback: form manual com token
            setError('Integração com SDK indisponível. Use o formulário manual abaixo.');
        }
        setSaving(false);
    };

    // Formulário simplificado para token manual (dev/sandbox)
    const handleManualToken = async (e) => {
        e.preventDefault();
        const token = e.target.elements.cardToken.value.trim();
        if (!token) {
            setError('Token obrigatório.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await cardService.saveCard(token);
            fetchCards();
            setShowAddForm(false);
            e.target.reset();
        } catch (err) {
            setError('Erro ao salvar cartão.');
        }
        setSaving(false);
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

                {/* Banner de Segurança */}
                <div className="bg-white rounded-md p-4 mb-6 shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-full shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-800 font-semibold mb-1">Seus dados estão seguros</p>
                        <p className="text-xs text-gray-500">Os cartões são tokenizados pelo Mercado Pago. Nunca armazenamos dados sensíveis do cartão diretamente.</p>
                    </div>
                </div>

                {/* Erro */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                {/* Formulário para Adicionar Cartão (Sandbox) */}
                {showAddForm && (
                    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard size={16} />
                            Adicionar Novo Cartão
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Em produção, o formulário do MercadoPago.js SDK será exibido aqui para capturar os dados do cartão de forma segura.
                            No ambiente sandbox, cole o <code className="bg-gray-100 px-1 rounded">card_token</code> gerado.
                        </p>
                        <form onSubmit={handleManualToken} className="flex gap-3">
                            <input
                                name="cardToken"
                                type="text"
                                placeholder="Cole o card_token aqui..."
                                className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[var(--azul-profundo)] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#0a1e33] transition disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </form>
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
                                    <div className="w-14 h-10 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 rounded-md flex items-center justify-center text-xs font-bold text-gray-600">
                                        {card.payment_method?.id?.toUpperCase?.() || 'CARD'}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {brandLogos[card.payment_method?.id] || '💳'} •••• •••• •••• {card.last_four_digits || '****'}
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
