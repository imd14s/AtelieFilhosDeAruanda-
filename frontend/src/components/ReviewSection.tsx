
import { Star, MessageSquare } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import ReviewSummary from './ReviewSummary';
import { Review } from '../types';
import UGCGallery from './reviews/UGCGallery';
import { ReviewItemSkeleton, UGCGallerySkeleton } from './reviews/ReviewSkeletons';

interface ReviewSectionProps {
    productId: string;
    reviews: Review[];
    loading: boolean;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, loading }) => {
    if (loading) return (
        <div className="space-y-12">
            <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-100 animate-pulse rounded" />
                <UGCGallerySkeleton />
            </div>
            <div className="space-y-8">
                {[1, 2, 3].map(i => <ReviewItemSkeleton key={i} />)}
            </div>
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

                    {/* UGC Gallery - Apenas fotos aprovadas que vem no media */}
                    <UGCGallery reviews={reviews} />

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

                        <div className="grid gap-12">
                            {reviews.map(review => (
                                <div key={review.id} className="group">
                                    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-50 last:border-0 group-last:pb-0">
                                        <div className="w-full md:w-48 shrink-0">
                                            <div className="flex gap-0.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={12} className={s <= review.rating ? "fill-[#C9A24D] text-[#C9A24D]" : "text-gray-200"} />
                                                ))}
                                            </div>
                                            <span className="font-lato text-sm font-bold text-[var(--azul-profundo)] block">{review.userName || review.user?.name || 'Cliente'}</span>
                                            {review.verifiedPurchase && <VerifiedBadge className="mt-1" />}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="relative">
                                                <span className="absolute -left-4 top-0 text-3xl text-gray-100 font-serif">"</span>
                                                <p className="font-lato text-gray-600 leading-relaxed italic pr-4">
                                                    {review.comment}
                                                </p>
                                            </div>

                                            <span className="text-[10px] font-lato text-gray-300 uppercase tracking-widest block">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('pt-BR') : ''}
                                            </span>

                                            {/* Resposta do Ateliê */}
                                            {review.adminResponse && (
                                                <div className="mt-6 bg-[#F7F7F4] p-6 rounded-sm border-l-2 border-[#C9A24D] relative">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-6 h-6 bg-[var(--azul-profundo)] rounded-full flex items-center justify-center">
                                                            <span className="text-[10px] text-white font-bold">A</span>
                                                        </div>
                                                        <span className="font-lato text-[11px] font-bold text-[var(--azul-profundo)] uppercase tracking-wider">Resposta do Ateliê</span>
                                                    </div>
                                                    <p className="font-lato text-sm text-[var(--azul-profundo)]/80 leading-relaxed">
                                                        {review.adminResponse}
                                                    </p>
                                                    {review.respondedAt && (
                                                        <span className="text-[9px] font-lato text-gray-400 uppercase tracking-widest mt-3 block">
                                                            Respondido em {new Date(review.respondedAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
