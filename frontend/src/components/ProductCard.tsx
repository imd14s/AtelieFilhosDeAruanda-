

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
 
import { cartService } from '../services/cartService';
import { useFavorites } from '../context/FavoritesContext';
import { ShoppingBag, Check, Heart } from 'lucide-react';

import Button from './ui/Button';
import Spinner from './ui/Spinner';
import { useToast } from '../context/ToastContext';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    initialIsFavorite?: boolean;
}

import OptimizedImage from './ui/OptimizedImage';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const favoritesContext = useFavorites();
    const [loading, setLoading] = useState<boolean>(false);
    const [added, setAdded] = useState<boolean>(false);
    const { addToast } = useToast();

    if (!favoritesContext) return null;

    const { isFavorite: checkFavorite, toggleFavorite, loading: favLoading } = favoritesContext;
    const isFavorite = checkFavorite(product.id);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleFavorite(product);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);

        setTimeout(() => {
            cartService.add(product, 1);
            addToast(`${product.name} adicionado!`, "success");
            setAdded(true);
            setLoading(false);
            setTimeout(() => setAdded(false), 2000);
        }, 300);
    };

    const isOutOfStock = (product.stockQuantity || 0) <= 0;
    const imageUrl = product.images?.[0] || '';

    // Calculate discount
    const originalPrice = product.originalPrice || product.price;
    const currentPrice = product.price;
    const hasDiscount = originalPrice > currentPrice;
    const discountPercentage = product.discountPercentage || (hasDiscount
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0);

    const priceFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(currentPrice || 0);

    const originalPriceFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(originalPrice || 0);

    return (
        <div className="group relative flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-sm border border-gray-100 max-w-[280px] mx-auto w-full">


            {/* Ícone de Favorito */}
            <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 group/fav ${isFavorite ? 'text-red-500' : 'text-[var(--azul-profundo)]/30 hover:text-red-500'}`}
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                {favLoading ? (
                    <Spinner size={14} className="text-gray-300" />
                ) : (
                    <Heart size={18} className={`${isFavorite ? 'fill-current' : 'transition-colors'}`} />
                )}
            </button>

            <Link to={`/produto/${product.id}`} className="relative aspect-square overflow-hidden bg-[var(--branco-off-white)] group-hover:opacity-95 transition-opacity">
                <OptimizedImage
                    src={imageUrl}
                    alt={product.title || product.name || 'Produto'}
                    width={280}
                    height={280}
                    productContext={{
                        name: product.name,
                        category: (product.category && typeof product.category === 'object') ? product.category.name : undefined
                    }}
                    className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-110 px-4"
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-[var(--marron-terra)] text-white text-[9px] font-lato font-bold px-4 py-1.5 uppercase tracking-[0.2em] shadow-lg">Esgotado</span>
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-1">
                {/* Marca em Dourado */}
                <span className="font-lato text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--dourado-suave)] mb-3 text-center block">
                    Ateliê Aruanda
                </span>

                <Link to={`/produto/${product.id}`} className="mb-1 block">
                    <h3
                        className="font-playfair text-base text-[var(--azul-profundo)] line-clamp-1 h-6 leading-6 text-center group-hover:text-[var(--dourado-suave)] transition-colors duration-300"
                        title={product.title || product.name || ''}
                    >
                        {product.title || product.name || 'Produto'}
                    </h3>
                </Link>

                <div className="mt-auto">
                    <div className="flex flex-col mb-4">
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-lato mb-0.5">
                                {originalPriceFormatted}
                            </span>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="font-lato text-xl font-black text-[var(--azul-profundo)]">
                                {priceFormatted}
                            </span>
                            {hasDiscount && (
                                <span className="text-[var(--verde-musgo)] font-lato text-xs font-bold tracking-tight">
                                    {discountPercentage}% OFF
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        isLoading={loading}
                        disabled={isOutOfStock}
                        variant="primary"
                        className={`w-full py-3 px-4 font-lato text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${added ? 'bg-[var(--verde-musgo)] border-[var(--verde-musgo)]' : ''}`}
                    >
                        {added ? (
                            <div className="flex items-center justify-center gap-2">
                                <Check size={14} strokeWidth={3} />
                                <span>Na Sacola</span>
                            </div>
                        ) : isOutOfStock ? (
                            'Indisponível'
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <ShoppingBag size={14} />
                                <span>Comprar</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
