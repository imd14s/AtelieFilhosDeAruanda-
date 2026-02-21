import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Image, Loader2, Plus, ArrowRight } from 'lucide-react';
import ReviewSummary from './ReviewSummary';
import ReviewForm from './ReviewForm';
import { storeService } from '../services/storeService';
import { getImageUrl } from '../utils/imageUtils';

const ReviewSection = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                // Simulado por enquanto, até ter o endpoint real injetado no storeService
                // const data = await storeService.getReviews(productId);
                // setReviews(data);

                // Mock data para desenvolvimento UI
                setReviews([
                    {
                        id: '1',
                        user: { name: 'Maria Silva' },
                        rating: 5,
                        comment: 'Simplesmente maravilhoso! O tecido é de altíssima qualidade e o caimento perfeito. Senti a energia logo que abri a caixa.',
                        createdAt: new Date().toISOString(),
                        media: [{ url: '/images/default.png', type: 'IMAGE' }]
                    },
                    {
                        id: '2',
                        user: { name: 'João Santos' },
                        rating: 4,
                        comment: 'Muito bonito e bem acabado. Chegou rápido e bem embalado.',
                        createdAt: new Date().toISOString(),
                        media: []
                    }
                ]);
            } catch (err) {
                console.error("Failed to load reviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId]);

    if (loading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#C9A24D]" />
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <h2 className="font-playfair text-3xl text-[var(--azul-profundo)] uppercase tracking-widest">Vozes do Axé</h2>
                    <p className="font-lato text-xs text-gray-400 uppercase tracking-widest">O que nossos clientes dizem sobre este item</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[var(--azul-profundo)] text-white px-8 py-4 font-lato text-[10px] uppercase tracking-[0.2em] rounded-sm hover:bg-[#C9A24D] transition-all flex items-center gap-3 shadow-md active:scale-95"
                >
                    {showForm ? 'Fechar Form' : <><Plus size={14} /> Avaliar Produto</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 p-8 rounded-sm border border-dashed border-gray-300 animate-in fade-in slide-in-from-top-4 duration-500">
                    <ReviewForm
                        productId={productId}
                        onReviewSubmitted={() => {
                            setShowForm(false);
                            // In a real app we would refetch reviews
                            alert('Avaliação enviada com sucesso! Ela passará por moderação.');
                        }}
                    />
                </div>
            )}

            <ReviewSummary reviews={reviews} />

            {/* Galeria de Fotos de Clientes (Opcional, como no mockup) */}
            <div className="space-y-6">
                <h4 className="font-playfair text-sm text-[var(--azul-profundo)] uppercase tracking-widest flex items-center gap-2">
                    <Image size={16} className="text-[#C9A24D]" /> Opiniões com fotos
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {reviews.flatMap(r => r.media || []).map((m, i) => (
                        <div key={i} className="w-40 h-56 bg-white shrink-0 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                            <img src={getImageUrl(m.url)} alt="Review" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Lista de Comentários */}
            <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h4 className="font-playfair text-sm text-[var(--azul-profundo)] uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={16} className="text-[#C9A24D]" /> Comentários
                    </h4>
                    <div className="flex gap-4 text-[10px] font-lato uppercase tracking-widest text-gray-400">
                        <button className="text-[var(--azul-profundo)] font-bold border-b border-[var(--azul-profundo)]">Mais Recentes</button>
                        <button className="hover:text-[var(--azul-profundo)] transition-colors">Mais Relevantes</button>
                    </div>
                </div>

                <div className="grid gap-8">
                    {reviews.map(review => (
                        <div key={review.id} className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-50 last:border-0">
                            <div className="w-full md:w-48 shrink-0">
                                <div className="flex gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={12} className={s <= review.rating ? "fill-[#C9A24D] text-[#C9A24D]" : "text-gray-200"} />
                                    ))}
                                </div>
                                <span className="font-lato text-sm font-bold text-[var(--azul-profundo)] block">{review.user.name}</span>
                                <span className="font-lato text-[10px] text-gray-400 uppercase tracking-widest">Verificado</span>
                            </div>
                            <div className="flex-1 space-y-4">
                                <p className="font-lato text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                                {review.media?.length > 0 && (
                                    <div className="flex gap-2">
                                        {review.media.map((m, i) => (
                                            <div key={i} className="aspect-square w-16 bg-white overflow-hidden rounded-sm border border-gray-100">
                                                <img src={getImageUrl(m.url)} alt="Anexo" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <span className="text-[10px] font-lato text-gray-300 uppercase tracking-widest block">
                                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
