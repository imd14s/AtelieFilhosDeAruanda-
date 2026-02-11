import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCarousel = ({ products }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    // Responsive items per page
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(1); // Mobile
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2); // Tablet
            } else {
                setItemsPerPage(3); // Desktop
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying || products.length <= itemsPerPage) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, products.length, itemsPerPage, totalPages]);

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    const goToSlide = (index) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    if (!products || products.length === 0) {
        return null;
    }

    const startIndex = currentIndex * itemsPerPage;
    const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden">
                <div className={`grid gap-8 transition-opacity duration-500 ${itemsPerPage === 1 ? 'grid-cols-1' :
                        itemsPerPage === 2 ? 'grid-cols-2' :
                            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    }`}>
                    {visibleProducts.map((product) => (
                        <div key={product.id} className="animate-fade-in">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            {totalPages > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white/90 hover:bg-white text-[var(--azul-profundo)] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                        aria-label="Produtos anteriores"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white/90 hover:bg-white text-[var(--azul-profundo)] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                        aria-label="Próximos produtos"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-[var(--dourado-suave)] w-8'
                                    : 'bg-[var(--azul-profundo)]/20 hover:bg-[var(--azul-profundo)]/40'
                                }`}
                            aria-label={`Ir para página ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductCarousel;
