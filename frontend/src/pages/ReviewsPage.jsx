import React, { useState } from 'react';
import { Star } from 'lucide-react';
import SEO from '../components/SEO';
import { useOutletContext } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

const MOCK_PENDING_REVIEWS = [
    {
        id: 'rev-pend-1',
        productId: 'prod-10',
        productName: 'Kit Slime Completo Neon - Colas Neon Novidade Promoção',
        image: '/images/default.png',
        purchaseDate: '08 de dez, 2025'
    },
    {
        id: 'rev-pend-2',
        productId: 'prod-11',
        productName: 'Pelúcia Sansão Turma Da Mônical Azul 49cm Antialérgico',
        image: '/images/default.png',
        purchaseDate: '08 de dez, 2025'
    },
    {
        id: 'rev-pend-3',
        productId: 'prod-1',
        productName: 'Kit Chimarrão Mate Gaúcho Bomba, Cuia Porongo, Porta Erva',
        image: '/images/default.png',
        purchaseDate: '08 de dez, 2025'
    },
    {
        id: 'rev-pend-4',
        productId: 'prod-3',
        productName: 'Projetor Portátil 4k Hd Android 11.0 Smart Wifi 5g Bluetooth',
        image: '/images/default.png',
        purchaseDate: '07 de abr, 2025'
    }
];

const MOCK_COMPLETED_REVIEWS = [
    // Mock future data here
];

const ReviewsPage = () => {
    const { user } = useOutletContext();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingReviews, setPendingReviews] = useState(MOCK_PENDING_REVIEWS);
    const [reviewItem, setReviewItem] = useState(null);

    if (!user) return null;

    const handleReviewSubmitted = (itemId) => {
        // Remove from pending immediately for optimistic UI
        setPendingReviews(prev => prev.filter(item => item.productId !== itemId));
        setReviewItem(null);
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
                            <img src={reviewItem.image} alt={reviewItem.productName} className="w-16 h-16 object-cover border border-gray-200 rounded" />
                            <div>
                                <h3 className="font-playfair text-xl text-[var(--azul-profundo)] mb-1">Avaliar Produto</h3>
                                <p className="font-lato text-sm text-gray-500 line-clamp-1">{reviewItem.productName}</p>
                            </div>
                        </div>
                        <ReviewForm
                            productId={reviewItem.productId}
                            onReviewSubmitted={() => handleReviewSubmitted(reviewItem.productId)}
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
                {activeTab === 'pending' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold text-gray-600">Dê sua opinião e ajude a mais pessoas</h2>
                            <span className="text-sm text-gray-400">
                                1 - {pendingReviews.length} de {pendingReviews.length} opiniões pendentes
                            </span>
                        </div>

                        <div className="space-y-4">
                            {pendingReviews.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-md border border-gray-200">
                                    <p className="text-gray-500">Você não tem opiniões pendentes no momento!</p>
                                </div>
                            ) : (
                                pendingReviews.map((item) => (
                                    <div key={item.id} className="bg-white rounded-md border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">

                                        {/* Imagem e Nome */}
                                        <div className="flex items-center gap-4 flex-1 w-full">
                                            <div className="w-16 h-16 shrink-0 border border-gray-200 rounded p-1 flex items-center justify-center bg-gray-50">
                                                <img src={item.image} alt={item.productName} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 md:pr-4">{item.productName}</h3>
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

                                        {/* Data */}
                                        <div className="text-xs text-gray-400 w-full md:w-48 md:text-right mt-4 md:mt-0">
                                            Comprado em {item.purchaseDate}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'completed' && (
                    <div className="text-center py-12 bg-white rounded-md border border-gray-200 mt-4">
                        <p className="text-gray-500">As opiniões que você já realizou aparecerão aqui no futuro.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
