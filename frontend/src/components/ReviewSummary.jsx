import React from 'react';
import { Star } from 'lucide-react';

const ReviewSummary = ({ reviews = [] }) => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: totalReviews > 0
            ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100
            : 0
    }));

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white p-8 rounded-sm shadow-sm border border-gray-50">
            {/* Média e Estrelas */}
            <div className="flex flex-col items-center text-center">
                <span className="text-6xl font-playfair text-[var(--azul-profundo)] mb-2">{averageRating}</span>
                <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            size={20}
                            className={s <= Math.round(averageRating) ? "fill-[#C9A24D] text-[#C9A24D]" : "text-gray-200"}
                        />
                    ))}
                </div>
                <span className="text-xs font-lato text-gray-400 uppercase tracking-widest">
                    {totalReviews.toLocaleString('pt-BR')} avaliações
                </span>
            </div>

            {/* Barras de Distribuição */}
            <div className="flex-1 w-full space-y-3">
                {ratingCounts.map(({ star, percentage, count }) => (
                    <div key={star} className="flex items-center gap-4 group">
                        <span className="text-xs font-lato text-gray-500 w-4">{star}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--azul-profundo)] group-hover:bg-[#C9A24D] transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-lato text-gray-400 w-8 text-right">
                            {percentage.toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* Características Subjetivas (Simulado como no Mockup) */}
            <div className="hidden lg:flex flex-col gap-6 w-64 pl-8 border-l border-gray-100">
                <div className="space-y-2">
                    <h4 className="font-playfair text-sm text-[var(--azul-profundo)] uppercase tracking-wider">Características</h4>
                    {['Qualidade', 'Custo-benefício', 'Confortável'].map(attr => (
                        <div key={attr} className="space-y-1">
                            <span className="text-[10px] font-lato uppercase tracking-widest text-gray-500">{attr}</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-1 flex-1 bg-[#C9A24D] rounded-full opacity-80" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewSummary;
