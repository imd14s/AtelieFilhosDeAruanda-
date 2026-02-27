
import { Star } from 'lucide-react';

interface RatingSummaryProps {
    averageRating: number | null;
    totalReviews: number;
    isLoading?: boolean;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ averageRating, totalReviews, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 animate-pulse">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-4 h-4 bg-gray-100 rounded-full" />
                    ))}
                </div>
                <div className="w-20 h-4 bg-gray-100 rounded" />
            </div>
        );
    }

    const avg = averageRating ?? 0;

    const scrollToReviews = () => {
        const element = document.getElementById('reviews');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <button
            onClick={scrollToReviews}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group text-left"
        >
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                    const fill = Math.min(Math.max(avg - (star - 1), 0), 1);
                    return (
                        <div key={star} className="relative w-4 h-4">
                            <Star
                                size={16}
                                className="text-gray-200 fill-gray-200 absolute inset-0"
                            />
                            {fill > 0 && (
                                <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: `${fill * 100}%` }}
                                >
                                    <Star
                                        size={16}
                                        className="text-[#C9A24D] fill-[#C9A24D]"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {totalReviews > 0 ? (
                <span className="text-sm font-lato text-gray-500 group-hover:text-[var(--azul-profundo)] transition-colors underline underline-offset-4 decoration-gray-200">
                    {avg.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
                </span>
            ) : (
                <span className="text-xs font-lato text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                    Seja o primeiro a avaliar
                </span>
            )}
        </button>
    );
};

export default RatingSummary;
