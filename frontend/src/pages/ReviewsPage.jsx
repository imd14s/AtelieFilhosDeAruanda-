import React, { useState, useEffect } from 'react';
import { Star, Clock, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import api from '../services/api';

// MOCK_REVIEWS removed in favor of real API data


const ReviewsPage = () => {
    const { user } = useOutletContext();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingReviews, setPendingReviews] = useState([]);
    const [completedReviews, setCompletedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewItem, setReviewItem] = useState(null);

    useEffect(() => {
        const userId = user?.id || user?.googleId;
        if (userId) {
            fetchReviews(userId);
        } else {
            setLoading(false);
        }
    }, [user, activeTab]);

    const fetchReviews = (userId) => {
        setLoading(true);
        const endpoint = activeTab === 'pending'
            ? `/reviews/user/${userId}/pending`
            : `/reviews/user/${userId}`;

        api.get(endpoint)
            .then(res => {
                if (activeTab === 'pending') {
                    setPendingReviews(res.data);
                } else {
                    setCompletedReviews(res.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching reviews:", err);
                setLoading(false);
            });
    };

    if (!user) return null;

    const handleReviewSubmitted = (itemId) => {
        setPendingReviews(prev => prev.filter(item => item.id !== itemId));
        setReviewItem(null);
        // Refresh to show in completed if tab switched
    };

    return (
        <div className="w-full pb-12 font-lato">
            <SEO title="Minhas Opiniões" description="Suas opiniões sobre os produtos comprados." />

            {/* Modal de Avaliação Reaproveitado */}
            {reviewItem && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-sm shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setReviewItem(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[var(--azul-profundo)] transition-colors"
                        >
                            ✕
                        </button>
                        <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-4">
                            <img src={reviewItem.images?.[0] || '/images/default.png'} alt={reviewItem.name} className="w-16 h-16 object-cover border border-gray-200 rounded" />
                            <div>
                                <h3 className="font-playfair text-xl text-[var(--azul-profundo)] mb-1">Avaliar Produto</h3>
                                <p className="font-lato text-sm text-gray-500 line-clamp-1">{reviewItem.name}</p>
                            </div>
                        </div>
                        <ReviewForm
                            productId={reviewItem.id}
                            onReviewSubmitted={() => handleReviewSubmitted(reviewItem.id)}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 pt-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 font-playfair">Opiniões</h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'pending'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Pendentes
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'completed'
                            ? 'border-blue-500 text-blue-500'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Realizadas
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : activeTab === 'pending' ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold text-gray-600">Dê sua opinião e ajude a mais pessoas</h2>
                            <span className="text-sm text-gray-400">
                                {pendingReviews.length} opiniões pendentes
                            </span>
                        </div>

                        <div className="space-y-4">
                            {pendingReviews.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-md border border-gray-200">
                                    <p className="text-gray-500">Você não tem produtos pendentes de avaliação!</p>
                                </div>
                            ) : (
                                pendingReviews.map((item) => (
                                    <div key={item.id} className="bg-white rounded-md border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">

                                        {/* Imagem e Nome */}
                                        <div className="flex items-center gap-4 flex-1 w-full">
                                            <div className="w-16 h-16 shrink-0 border border-gray-200 rounded p-1 flex items-center justify-center bg-gray-50">
                                                <img src={item.images?.[0] || '/images/default.png'} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 md:pr-4">{item.name}</h3>
                                        </div>

                                        {/* Estrelas Clicáveis para Avaliar */}
                                        <div className="flex items-center gap-1 group cursor-pointer" onClick={() => setReviewItem(item)}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={28}
                                                    strokeWidth={1}
                                                    className="text-gray-300 group-hover:text-blue-500 group-hover:fill-blue-100 transition-colors"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {completedReviews.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-md border border-gray-200">
                                <p className="text-gray-500">Você ainda não avaliou nenhum produto.</p>
                            </div>
                        ) : (
                            completedReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 shrink-0 border border-gray-100 rounded p-1 flex items-center justify-center">
                                            <img src={review.product?.images?.[0] || '/images/default.png'} alt={review.product?.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{review.product?.name}</h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "#EAB308" : "none"}
                                                        className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                                    {review.status !== 'APPROVED' && (
                                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-700 text-[10px] uppercase font-bold rounded">
                                            <Clock size={12} /> {review.status === 'PENDING' ? 'Em moderação' : 'Rejeitada'}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
