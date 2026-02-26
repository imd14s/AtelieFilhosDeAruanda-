import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import ReviewSummary from './ReviewSummary';
import { productService } from '../services/productService';
import { getImageUrl } from '../utils/imageUtils';

const ReviewSection = ({ productId, onReviewAdded, onReviewsLoaded }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const data = await productService.getReviews(productId);
                setReviews(data || []);
                onReviewsLoaded?.(data || []);
            } catch (err) {
                console.error("[ReviewSection] Falha ao carregar reviews:", err);
                setReviews([]);
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
            <div className="space-y-2">
                <h2 className="font-playfair text-3xl text-[var(--azul-profundo)] uppercase tracking-widest">Vozes do Axé</h2>
                <p className="font-lato text-xs text-gray-400 uppercase tracking-widest">O que nossos clientes dizem sobre este item</p>
            </div>

            {reviews.length > 0 ? (
                <>
                    <ReviewSummary reviews={reviews} />

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
                                        <span className="font-lato text-[10px] text-gray-400 uppercase tracking-widest">Compra Verificada</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <p className="font-lato text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                                        <span className="text-[10px] font-lato text-gray-300 uppercase tracking-widest block">
                                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-20 text-center bg-gray-50/50 rounded-sm border border-dashed border-gray-200">
                    <Star size={40} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="font-playfair text-xl text-[var(--azul-profundo)] mb-2">Ainda não há avaliações</h3>
                    <p className="font-lato text-sm text-gray-400 max-w-xs mx-auto">
                        Após realizar uma compra, você poderá avaliar este produto no seu perfil.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
