import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle,
    XCircle,
    MessageSquare,
    Star,
    Filter,
    Video,
    Check
} from 'lucide-react';
import { ReviewService } from '../../services/ReviewService';
import { Review } from '../../types/review';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReviewManagementPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        status: 'PENDING',
        rating: [] as number[],
        hasMedia: false
    });
    const [responseModal, setResponseModal] = useState<{ isOpen: boolean; reviewId: string | null; text: string }>({
        isOpen: false,
        reviewId: null,
        text: ''
    });

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ReviewService.getReviews({
                status: filters.status,
                ratings: filters.rating.length > 0 ? filters.rating : undefined,
                hasMedia: filters.hasMedia || undefined
            });
            setReviews(data.content || []);
        } catch (error) {
            console.error('Erro ao buscar avaliações', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await ReviewService.moderateReview(id, status);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch {
            alert('Erro ao moderar avaliação');
        }
    };

    const handleBatchModerate = async (status: 'APPROVED' | 'REJECTED') => {
        try {
            await ReviewService.batchModerate(selectedReviews, status);
            setReviews(prev => prev.filter(r => !selectedReviews.includes(r.id)));
            setSelectedReviews([]);
        } catch {
            alert('Erro na moderação em lote');
        }
    };

    const handleSendResponse = async () => {
        if (!responseModal.reviewId || !responseModal.text) return;
        try {
            await ReviewService.respondToReview(responseModal.reviewId, responseModal.text);
            setResponseModal({ isOpen: false, reviewId: null, text: '' });
            fetchReviews();
        } catch {
            alert('Erro ao enviar resposta');
        }
    };

    const toggleStatus = (status: string) => {
        setFilters(prev => ({ ...prev, status }));
    };

    const toggleRatingFilter = (rating: number) => {
        setFilters(prev => {
            const newRatings = prev.rating.includes(rating)
                ? prev.rating.filter(r => r !== rating)
                : [...prev.rating, rating];
            return { ...prev, rating: newRatings };
        });
    };

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Feedbacks</h1>
                    <p className="text-gray-500">Modere avaliações e responda seus clientes</p>
                </div>
                <div className="flex gap-2">
                    {selectedReviews.length > 0 && (
                        <div className="flex items-center gap-2 pr-4 border-r mr-2">
                            <span className="text-sm font-medium text-gray-700">{selectedReviews.length} selecionados</span>
                            <button
                                onClick={() => handleBatchModerate('APPROVED')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> Aprovar em lote
                            </button>
                            <button
                                onClick={() => handleBatchModerate('REJECTED')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
                            >
                                <XCircle size={16} /> Rejeitar em lote
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Filters */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Filter size={16} /> Filtros
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Status</label>
                                <div className="flex flex-col gap-1">
                                    {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => toggleStatus(s)}
                                            className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${filters.status === s ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {s === 'PENDING' ? 'Pendentes' : s === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                                            {filters.status === s && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Nota</label>
                                <div className="grid grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => toggleRatingFilter(n)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-sm transition-all ${filters.rating.includes(n) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                        >
                                            <span className="font-bold">{n}</span>
                                            <Star size={12} fill={filters.rating.includes(n) ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm text-gray-600">Apenas com mídia</span>
                                <input
                                    type="checkbox"
                                    checked={filters.hasMedia}
                                    onChange={(e) => setFilters(prev => ({ ...prev, hasMedia: e.target.checked }))}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Reviews List */}
                <main className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center text-gray-400">Carregando avaliações...</div>
                        ) : reviews.length === 0 ? (
                            <div className="p-20 text-center">
                                <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500">Nenhuma avaliação encontrada</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedReviews(reviews.map(r => r.id));
                                                    else setSelectedReviews([]);
                                                }}
                                            />
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Cliente / Produto</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Avaliação</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase">Data</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reviews.map(review => (
                                        <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedReviews.includes(review.id)}
                                                    onChange={() => {
                                                        setSelectedReviews(prev =>
                                                            prev.includes(review.id) ? prev.filter(id => id !== review.id) : [...prev, review.id]
                                                        );
                                                    }}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{review.userName || 'Cliente Anônimo'}</span>
                                                    <span className="text-xs text-indigo-600 mt-0.5">{review.productName || 'Produto não identificado'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs">
                                                <div className="flex items-center gap-1 mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            fill={i < review.rating ? "#F59E0B" : "none"}
                                                            color={i < review.rating ? "#F59E0B" : "#D1D5DB"}
                                                        />
                                                    ))}
                                                    {review.verifiedPurchase && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded ml-2">Verificado</span>}
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                                                <div className="flex gap-2 mt-2">
                                                    {review.media?.map(m => (
                                                        <div key={m.id} className="relative w-8 h-8 rounded border bg-gray-100 flex items-center justify-center">
                                                            {m.type === 'IMAGE' ? <ImageIcon size={12} /> : <Video size={12} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                {format(new Date(review.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {filters.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleModerate(review.id, 'APPROVED')}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Aprovar"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleModerate(review.id, 'REJECTED')}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Rejeitar"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setResponseModal({ isOpen: true, reviewId: review.id, text: review.adminResponse || '' })}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Responder Oficialmente"
                                                    >
                                                        <MessageSquare size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {/* Response Modal */}
            {responseModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Resposta Oficial do Ateliê</h2>
                            <button onClick={() => setResponseModal({ isOpen: false, reviewId: null, text: '' })}>
                                <MoreVertical size={20} className="rotate-90 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Escreva sua resposta pública:</label>
                            <textarea
                                className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-sm"
                                placeholder="Agradeça o cliente ou esclareça dúvidas..."
                                value={responseModal.text}
                                onChange={(e) => setResponseModal(prev => ({ ...prev, text: e.target.value }))}
                            />
                            <p className="mt-2 text-xs text-gray-400 italic">
                                * Esta resposta aparecerá publicamente abaixo do comentário do cliente.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                            <button
                                onClick={() => setResponseModal({ isOpen: false, reviewId: null, text: '' })}
                                className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendResponse}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                            >
                                Enviar Resposta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewManagementPage;
