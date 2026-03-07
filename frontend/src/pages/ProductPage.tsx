import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import SEO from '../components/SEO';
import { useFavorites } from '../context/FavoritesContext';
import { ShoppingBag, ShieldCheck, Truck, RefreshCcw, ChevronLeft, Play, X, Maximize2, Heart } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import { usePayment } from '../context/PaymentContext';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import { Product, Variant, Review } from '../types';

const ProductPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = authService.getUser();
    const { isFavorite: checkFavorite, toggleFavorite, loading: favLoading } = useFavorites();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [added, setAdded] = useState<boolean>(false);
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
    const { addToast } = useToast();
    const { settings, loading: paymentLoading } = usePayment();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [mainMedia, setMainMedia] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);

    const isFavorite = id ? checkFavorite(id) : false;

    const handleToggleFavorite = async () => {
        if (!product) return;
        await toggleFavorite(product);
    };

    // UI State
    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
    const [zoomPos, setZoomPos] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
    const mainImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await productService.getProductById(id);
                setProduct(data);
                if (data?.images && data.images.length > 0) {
                    setMainMedia(data.images[0]);
                } else if (data?.image) {
                    setMainMedia(data.image);
                }

                // Registrar no histórico de navegação via API se o usuário estiver logado
                if (user?.id) {
                    orderService.history.add(user.id, data.id);
                }

                if (data?.variants && data.variants.length > 0) {
                    const firstActiveVariant = data.variants.find(v => (v.active !== false) && v.stockQuantity > 0) || data.variants[0];
                    if (firstActiveVariant && firstActiveVariant.attributesJson) {
                        try {
                            const attrs = JSON.parse(firstActiveVariant.attributesJson);
                            setSelectedOptions(attrs);
                            setCurrentVariant(firstActiveVariant);

                            const variantImg = (firstActiveVariant.images && firstActiveVariant.images.length > 0) ? firstActiveVariant.images[0] : firstActiveVariant.imageUrl;
                            const isDefault = variantImg?.includes('default.png');
                            
                            if (variantImg && !isDefault) {
                                const parsedImageUrl = variantImg.includes(',') ? variantImg.split(',')[0].trim() : variantImg;
                                setMainMedia(parsedImageUrl);
                            } else if (data?.images?.[0] || data?.image) {
                                setMainMedia(data.images?.[0] || data.image || null);
                            }
                        } catch (e) {
                            console.error("Error parsing variant attributes", e);
                        }
                    }
                }

                // Buscar recomendações
                setLoadingRecs(true);
                try {
                    let recs: Product[] = [];
                    if (data?.categoryId) {
                        recs = await productService.getProducts({ categoryId: data.categoryId });
                        recs = recs.filter(r => r.id !== id);
                    }
                    setRecommendations(recs.slice(0, 4));
                } catch (e) {
                    console.error("Error fetching recommendations", e);
                    setRecommendations([]);
                }
                setLoadingRecs(false);
            } catch (err) {
                console.error("Failed to load product", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const availableAttributes = useMemo(() => {
        if (!product?.variants) return {};
        const attrs: Record<string, Set<string>> = {};
        product.variants.forEach(variant => {
            if (variant.active === false) return;
            try {
                const parsed = JSON.parse(variant.attributesJson || '{}');
                Object.entries(parsed).forEach(([key, value]) => {
                    if (!attrs[key]) attrs[key] = new Set();
                    attrs[key].add(String(value));
                });
            } catch (e) { }
        });
        const result: Record<string, string[]> = {};
        Object.keys(attrs).forEach(k => result[k] = Array.from(attrs[k]));
        return result;
    }, [product]);

    // Mídias da variante selecionada
    const variantMedias = useMemo(() => {
        const isDefaultImage = (url: string) => !url || url.includes('default.png');

        if (currentVariant) {
            const seen = new Set<string>();
            const imgs: string[] = [];
            
            const addUnique = (url: string | undefined) => {
                if (!url) return;
                const urlsToProcess = url.includes(',') ? url.split(',').map(u => u.trim()) : [url];
                
                urlsToProcess.forEach(u => {
                    if (u && !seen.has(u) && !isDefaultImage(u)) {
                        seen.add(u);
                        imgs.push(u);
                    }
                });
            };
            
            addUnique(currentVariant.imageUrl);
            (currentVariant.images || []).forEach(addUnique);
            return imgs.length > 0 ? imgs : (product?.images?.filter(img => !isDefaultImage(img)).slice(0, 1) ?? []);
        }
        return (product?.images || []).filter(img => !isDefaultImage(img));
    }, [currentVariant, product]);

    const handleOptionSelect = (key: string, value: string) => {
        const newOptions = { ...selectedOptions, [key]: value };
        setSelectedOptions(newOptions);

        if (product?.variants) {
            const matched = product.variants.find(v => {
                try {
                    const attrs = JSON.parse(v.attributesJson || '{}');
                    return Object.entries(newOptions).every(([k, val]) => attrs[k] === val);
                } catch (e) {
                    return false;
                }
            });

            if (matched) {
                setCurrentVariant(matched);
                const variantImg = (matched.images && matched.images.length > 0) ? matched.images[0] : matched.imageUrl;
                const isDefault = variantImg?.includes('default.png');
                
                if (variantImg && !isDefault) {
                    const parsedImageUrl = variantImg.includes(',') ? variantImg.split(',')[0].trim() : variantImg;
                    setMainMedia(parsedImageUrl);
                } else if (product?.images?.[0] || product?.image) {
                    setMainMedia(product.images?.[0] || product.image || null);
                }
            } else {
                setCurrentVariant(null);
            }
        }
    };

    const displayPrice = currentVariant ? currentVariant.price : product?.price || 0;
    const originalPrice = product?.originalPrice || displayPrice;
    const hasDiscount = originalPrice > displayPrice;
    const discountPercentage = product?.discountPercentage || (hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0);

    const displayStock = currentVariant ? currentVariant.stockQuantity : product?.stockQuantity || 0;
    const isOutOfStock = displayStock <= 0;

    const handleReviewAdded = (newReview: Review) => {
        setProduct(prev => {
            if (!prev) return null;
            const newTotal = (prev.totalReviews || 0) + 1;
            const currentAvg = prev.averageRating || 4.6;
            const newAvg = ((currentAvg * (prev.totalReviews || 1)) + newReview.rating) / newTotal;

            return {
                ...prev,
                totalReviews: newTotal,
                averageRating: parseFloat(newAvg.toFixed(1))
            };
        });
    };

    const handleReviewsLoaded = (loadedReviews: Review[]) => {
        if (!loadedReviews?.length) return;
        const total = loadedReviews.length;
        const avg = loadedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
        setProduct(prev => {
            if (!prev) return null;
            return {
                ...prev,
                totalReviews: total,
                averageRating: parseFloat(avg.toFixed(1))
            };
        });
    };

    useEffect(() => {
        setQuantity(1);
    }, [currentVariant?.id]);

    const handleAddToCart = () => {
        if (!product || isOutOfStock) return;

        let finalQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;

        // Regra: Nunca permitir 0, sempre mudar para 1
        if (isNaN(finalQuantity) || finalQuantity <= 0) {
            finalQuantity = 1;
            setQuantity(1);
            addToast("A quantidade mínima é 1 unidade. Ajustamos para você.", "info");
        }

        // Regra: Validar contra estoque no momento da compra
        if (finalQuantity > displayStock) {
            addToast(`Desculpe, temos apenas ${displayStock} unidades em estoque.`, "error");
            return;
        }

        const variantImage = currentVariant?.images?.[0] ?? product.images?.[0];

        const cartProduct = {
            id: product.id,
            name: currentVariant
                ? `${product.name} (${Object.values(selectedOptions).join(', ')})`
                : product.name,
            price: displayPrice,
            image: variantImage,
        };

        cartService.add(cartProduct, finalQuantity, currentVariant?.id ?? null);
        addToast(`${product.name} adicionado ao carrinho!`, "success");
        setAdded(true);
        setTimeout(() => setAdded(false), 3000);
    };

    const isVideo = (url: string | null) => {
        if (!url) return false;
        const lower = String(url).toLowerCase();
        return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!mainImageRef.current || isVideo(mainMedia)) return;
        const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setZoomPos({ x, y, show: true });
    };

    const renderMedia = (url: string | null, isMain: boolean = false) => {
        if (!url) return null;
        if (isVideo(url)) {
            return (
                <video
                    src={getImageUrl(url)}
                    className="w-full h-full object-cover"
                    controls={isMain}
                    autoPlay={isMain}
                    muted={isMain}
                    loop={isMain}
                    playsInline
                />
            );
        }
        return (
            <img
                ref={isMain ? mainImageRef : null}
                src={getImageUrl(url)}
                alt={product?.name || "Produto"}
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/default.png'; }}
                className="w-full h-full object-cover"
                onMouseMove={isMain ? handleMouseMove : undefined}
                onMouseLeave={isMain ? () => setZoomPos(prev => ({ ...prev, show: false })) : undefined}
                onClick={isMain ? () => setIsLightboxOpen(true) : undefined}
            />
        );
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F7F7F4]">
            <Spinner size={40} className="text-[#C9A24D]" />
            <p className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/40">Carregando Axé...</p>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F4]">
            <div className="text-center">
                <p className="font-playfair text-xl text-[#0f2A44] mb-4">Produto não encontrado.</p>
                <Link to="/store" className="text-[var(--dourado-suave)] hover:underline font-lato text-sm">Voltar para a loja</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={product.name}
                description={product.description?.substring(0, 160)}
                image={product.images?.[0] || product.image}
                type="product"
            />

            {/* Lightbox Modal */}
            {isLightboxOpen && mainMedia && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-6 right-6 text-white hover:text-[#C9A24D] transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <div className="max-w-4xl w-full h-full flex items-center justify-center">
                        {isVideo(mainMedia) ? (
                            <video src={getImageUrl(mainMedia)} controls autoPlay className="max-h-full max-w-full" />
                        ) : (
                            <img src={getImageUrl(mainMedia)} alt={product.name} className="max-h-full max-w-full object-contain" />
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 lg:py-12">
                <div className="mb-8">
                    <Link
                        to="/store"
                        className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-[var(--azul-profundo)] transition-all"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar para o catálogo
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
                    <div className="flex flex-row gap-4 flex-1">
                        {variantMedias.length > 0 && (
                            <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
                                {variantMedias.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setMainMedia(img)}
                                        className={`aspect-square bg-white overflow-hidden shadow-sm transition-all cursor-pointer relative rounded-sm ${mainMedia === img ? 'ring-2 ring-[var(--azul-profundo)]' : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        {renderMedia(img, false)}
                                        {isVideo(img) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <Play size={10} className="text-white fill-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 relative group cursor-crosshair">
                            <div className="aspect-[4/5] bg-white overflow-hidden shadow-sm relative rounded-sm">
                                {renderMedia(mainMedia, true)}

                                {zoomPos.show && !isVideo(mainMedia) && mainMedia && (
                                    <div
                                        className="absolute inset-0 pointer-events-none overflow-hidden z-10"
                                        style={{
                                            backgroundImage: `url(${getImageUrl(mainMedia)})`,
                                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                            backgroundSize: '200%',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                )}

                                {!mainMedia && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <span className="font-playfair text-[var(--azul-profundo)]/30 text-xl font-bold tracking-widest text-center uppercase">Imagem<br />Indisponível</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Maximize2 size={18} className="text-[var(--azul-profundo)]" />
                                </button>
                            </div>

                            <div className="flex md:hidden flex-row gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                                {variantMedias.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setMainMedia(img)}
                                        className={`aspect-square w-16 bg-white shrink-0 overflow-hidden shadow-sm transition-all relative rounded-sm ${mainMedia === img ? 'ring-2 ring-[var(--dourado-suave)]' : 'opacity-60'}`}
                                    >
                                        {renderMedia(img, false)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col pt-4 lg:pt-0">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <h1 className="font-playfair text-3xl md:text-[40px] text-[var(--azul-profundo)] leading-tight font-medium">
                                        {product.name || 'Produto sem título'}
                                    </h1>
                                    <button
                                        onClick={handleToggleFavorite}
                                        disabled={favLoading}
                                        className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border
                                            ${isFavorite
                                                ? 'bg-red-50 border-red-100 text-red-500'
                                                : 'bg-white border-gray-100 text-[var(--azul-profundo)]/30 hover:text-red-500 hover:border-red-100'
                                            }`}
                                        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                    >
                                        {favLoading ? (
                                            <Spinner size={16} className="text-gray-300" />
                                        ) : (
                                            <Heart size={24} className={isFavorite ? "fill-current" : ""} />
                                        )}
                                    </button>
                                </div>

                                {(() => {
                                    const avg = product.averageRating ?? 0;
                                    const total = product.totalReviews ?? 0;
                                    return (
                                        <div className="flex items-center gap-2">
                                            {total > 0 ? (
                                                <>
                                                    <span className="text-sm font-lato text-gray-500">{avg.toFixed(1)}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => {
                                                            const fill = Math.min(Math.max(avg - (star - 1), 0), 1);
                                                            return (
                                                                <span key={star} className="relative inline-block w-4 h-4">
                                                                    <svg className="w-4 h-4 text-gray-300 fill-gray-300 absolute inset-0" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                    <svg
                                                                        className="w-4 h-4 text-[#3483fa] fill-[#3483fa] absolute inset-0"
                                                                        viewBox="0 0 20 20"
                                                                        style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
                                                                    >
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="text-sm font-lato text-gray-400">({total} {total === 1 ? 'avaliação' : 'avaliações'})</span>
                                                </>
                                            ) : (
                                                <span className="text-xs font-lato text-gray-400 uppercase tracking-widest">Sem avaliações ainda</span>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="flex flex-col gap-1 mt-6">
                                    {hasDiscount && (
                                        <span className="font-lato text-gray-400 line-through text-lg">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
                                        </span>
                                    )}
                                    <div className="flex items-baseline gap-3">
                                        <span className="font-lato text-[44px] text-[var(--azul-profundo)] font-bold leading-none">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice)}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-green-600 font-bold font-lato text-lg">
                                                {discountPercentage}% OFF
                                            </span>
                                        )}
                                    </div>

                                    {paymentLoading ? (
                                        <div className="h-5 w-32 bg-gray-100 animate-pulse rounded mt-1" />
                                    ) : (
                                        <>
                                            <span className="text-sm font-lato text-[var(--azul-profundo)]">
                                                {settings?.mercadoPago?.enabled ? (
                                                    (() => {
                                                        const card = settings.mercadoPago.methods.card;
                                                        const max = card.maxInstallments || 12;
                                                        const interestFree = card.interestFree || 1;
                                                        const installmentValue = displayPrice / max;

                                                        return (
                                                            <>
                                                                {max}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)}
                                                                {interestFree >= max && <span className="ml-1 text-[#00a650] font-bold">sem juros</span>}
                                                            </>
                                                        );
                                                    })()
                                                ) : (
                                                    `1x ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice)}`
                                                )}
                                            </span>
                                            <button
                                                onClick={() => setIsPaymentModalOpen(true)}
                                                className="text-[var(--azul-claro)] text-sm font-lato hover:underline text-left mt-1"
                                            >
                                                Ver os meios de pagamento
                                            </button>
                                        </>
                                    )}
                                </div>

                                {displayStock <= 5 && displayStock > 0 && (
                                    <p className="text-xs text-amber-600 font-lato mt-4 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                                        Últimas unidades em estoque!
                                    </p>
                                )}
                                {isOutOfStock && (
                                    <p className="text-xs font-bold text-red-600 font-lato mt-4">Fora de Estoque</p>
                                )}
                            </div>

                            {product.variants && product.variants.length > 0 && (() => {
                                const activeVariants = product.variants.filter(v => v.active !== false);

                                return (
                                    <div className="py-5 border-y border-gray-100 space-y-3">
                                        {Object.keys(selectedOptions).length > 0 && (
                                            <p className="font-lato text-sm text-gray-700">
                                                {Object.entries(selectedOptions).map(([k, v], i) => (
                                                    <span key={k}>
                                                        {i > 0 && <span className="mx-2 text-gray-300">·</span>}
                                                        <span className="font-semibold capitalize">{k}:</span>{' '}
                                                        <span className="font-bold uppercase tracking-wide text-[var(--azul-profundo)]">{v}</span>
                                                    </span>
                                                ))}
                                            </p>
                                        )}

                                        <div className="flex flex-row gap-2 overflow-x-auto pb-1">
                                            {activeVariants.map((variant) => {
                                                const isSelected = currentVariant?.id === variant.id;
                                                const variantImg = (variant.images && variant.images.length > 0) ? variant.images[0] : variant.imageUrl;
                                                const isDefaultThumb = variantImg?.includes('default.png');
                                                const thumbSrc = !isDefaultThumb && variantImg
                                                    ? variantImg
                                                    : (product.images?.[0] || product.image || '/images/default.png');

                                                let variantAttrs: Record<string, string> = {};
                                                try { variantAttrs = JSON.parse(variant.attributesJson || '{}'); } catch { /* noop */ }
                                                const tooltipLabel = Object.entries(variantAttrs)
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(' | ') || `Variante ${variant.id}`;

                                                return (
                                                    <button
                                                        key={variant.id}
                                                        title={tooltipLabel}
                                                        onClick={() => {
                                                            setCurrentVariant(variant);
                                                            setSelectedOptions(variantAttrs);

                                                            const variantImg = (variant.images && variant.images.length > 0) ? variant.images[0] : variant.imageUrl;
                                                            const isDefaultSelection = variantImg?.includes('default.png');
                                                            
                                                            if (variantImg && !isDefaultSelection) {
                                                                setMainMedia(variantImg);
                                                            } else if (product?.images?.[0] || product?.image) {
                                                                setMainMedia(product.images?.[0] || product.image || null);
                                                            }
                                                        }}
                                                        className={`shrink-0 w-[64px] h-[64px] rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none
                                                            ${isSelected
                                                                ? 'border-[#3483fa] ring-2 ring-[#3483fa] ring-offset-1'
                                                                : 'border-gray-200 hover:border-gray-400'
                                                            }
                                                        `}
                                                    >
                                                        <img
                                                            src={getImageUrl(thumbSrc)}
                                                            alt={tooltipLabel}
                                                            className="w-full h-full object-cover"
                                                            onError={e => { (e.target as HTMLImageElement).src = '/images/default.png'; }}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex flex-col gap-4 pt-4">
                                <div className="flex flex-col gap-2">
                                    <span className="font-lato text-sm text-[var(--azul-profundo)]/70 uppercase tracking-widest font-bold">Quantidade</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-[4px] bg-white overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => {
                                                    const current = typeof quantity === 'string' ? (parseInt(quantity) || 0) : quantity;
                                                    setQuantity(Math.max(1, current - 1));
                                                }}
                                                disabled={(typeof quantity === 'number' && quantity <= 1)}
                                                className="w-12 h-12 flex items-center justify-center text-[var(--azul-profundo)] hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                                                aria-label="Diminuir quantidade"
                                            >
                                                <span className="text-xl font-medium">−</span>
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        setQuantity(''); // Permite apagar tudo para digitar
                                                    } else {
                                                        const parsed = parseInt(val);
                                                        if (!isNaN(parsed)) {
                                                            setQuantity(parsed); // Permite digitar qualquer valor (validação no checkout/compra)
                                                        }
                                                    }
                                                }}
                                                className="w-16 h-12 text-center font-lato text-lg text-[var(--azul-profundo)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                onClick={() => {
                                                    const current = typeof quantity === 'string' ? (parseInt(quantity) || 0) : quantity;
                                                    setQuantity(current + 1);
                                                }}
                                                className="w-12 h-12 flex items-center justify-center text-[var(--azul-profundo)] hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-l border-gray-200"
                                                aria-label="Aumentar quantidade"
                                            >
                                                <span className="text-xl font-medium">+</span>
                                            </button>
                                        </div>
                                        {displayStock > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 text-xs font-lato">
                                                    ({displayStock} disponíveis)
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-red-400 text-xs font-lato font-bold">Sem estoque</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => {
                                            handleAddToCart();
                                            navigate('/checkout');
                                        }}
                                        disabled={isOutOfStock}
                                        variant="primary"
                                        className="w-full h-[58px] text-[20px] rounded-[4px]"
                                    >
                                        Comprar agora
                                    </Button>

                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                        variant="outline"
                                        className="w-full h-[58px] text-[20px] rounded-[4px] bg-[#e3edfb] border-none text-[#3483fa] hover:bg-[#d0e1f9] hover:text-[#3483fa]"
                                    >
                                        <ShoppingBag size={24} />
                                        Adicionar ao carrinho
                                    </Button>

                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 mt-4">
                                <div className="flex items-center gap-3 p-3 bg-white border border-gray-50 rounded-sm">
                                    <Truck size={18} className="text-[#C9A24D]" />
                                    <span className="text-[10px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/80">Frete Grátis</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white border border-gray-50 rounded-sm">
                                    <ShieldCheck size={18} className="text-[#C9A24D]" />
                                    <span className="text-[10px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/80">Seguro</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white border border-gray-50 rounded-sm">
                                    <RefreshCcw size={18} className="text-[#C9A24D]" />
                                    <span className="text-[10px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/80">7 Dias Devolução</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 space-y-24">
                    <section className="max-w-4xl mx-auto">
                        <h2 className="font-playfair text-2xl text-[var(--azul-profundo)] mb-8 pb-4 border-b border-[var(--azul-profundo)]/10 text-center uppercase tracking-widest">Sobre este Axé</h2>
                        <div className="prose prose-slate max-w-none font-lato text-[var(--azul-profundo)]/70 text-lg leading-relaxed text-center italic">
                            {product.description}
                        </div>
                    </section>

                    <section className="space-y-12">
                        <div className="text-center">
                            <h2 className="font-playfair text-[32px] text-[var(--azul-profundo)] mb-2 uppercase tracking-[0.2em] font-medium">Você também vai amar</h2>
                            <div className="h-[2px] w-24 bg-[#3483fa] mx-auto" />
                        </div>

                        {loadingRecs ? (
                            <div className="flex justify-center py-12">
                                <Spinner className="text-[#3483fa]" />
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {recommendations.map(req => (
                                    <ProductCard key={req.id} product={req} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 font-lato text-xs uppercase tracking-widest">Sem recomendações para este item no momento.</p>
                        )}
                    </section>

                    <section id="reviews" className="space-y-12 bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-sm">
                        {id && (
                            <ReviewSection
                                productId={id}
                                onReviewAdded={handleReviewAdded}
                                onReviewsLoaded={handleReviewsLoaded}
                            />
                        )}
                    </section>
                </div>
            </div>
            {/* Modal de Meios de Pagamento */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500">
                        <header className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-playfair text-xl text-[var(--azul-profundo)] font-bold">Meios de Pagamento</h3>
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-[var(--azul-profundo)]"
                            >
                                <X size={24} />
                            </button>
                        </header>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            {settings?.mercadoPago?.methods.card.active && (
                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-400">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Heart size={16} className="fill-current" />
                                        </div>
                                        Cartão de Crédito
                                    </h4>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-lg font-lato text-[var(--azul-profundo)] mb-1">
                                            Em até <strong>{settings.mercadoPago.methods.card.maxInstallments}x</strong> no cartão
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {settings.mercadoPago.methods.card.interestFree && settings.mercadoPago.methods.card.interestFree > 1
                                                ? `Parcelamento sem juros em até ${settings.mercadoPago.methods.card.interestFree}x.`
                                                : 'Consulte as taxas para parcelamento com juros.'}
                                        </p>
                                        <div className="flex gap-3 mt-4">
                                            <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-black italic text-blue-800 shadow-sm">VISA</div>
                                            <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-black italic text-orange-600 shadow-sm">MASTER</div>
                                            <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-black italic text-blue-500 shadow-sm">ELO</div>
                                            <div className="h-8 w-12 bg-white border rounded flex items-center justify-center text-[10px] font-black italic text-red-600 shadow-sm">AMEX</div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {settings?.mercadoPago?.methods.pix.active && (
                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-400">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                            <Play size={16} className="fill-current rotate-90" />
                                        </div>
                                        PIX
                                    </h4>
                                    <div className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-lg font-lato text-green-800 font-bold mb-1">Pagamento Instantâneo</p>
                                                <p className="text-sm text-green-700/80 leading-relaxed">
                                                    Aprovação na hora. {settings.mercadoPago.methods.pix.discountPercent && settings.mercadoPago.methods.pix.discountPercent > 0
                                                        ? `Aproveite ${settings.mercadoPago.methods.pix.discountPercent}% de desconto!`
                                                        : 'Ganhe agilidade na entrega do seu pedido.'}
                                                </p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg shadow-sm font-black italic text-green-500 transform -rotate-12 border border-green-100">PIX</div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {settings?.mercadoPago?.methods.boleto.active && (
                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-400">
                                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                            <RefreshCcw size={16} />
                                        </div>
                                        Boleto Bancário
                                    </h4>
                                    <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                                        <p className="text-lg font-lato text-orange-800 font-bold mb-1">Praticidade no Pagamento</p>
                                        <p className="text-sm text-orange-700/80">Vencimento em 3 dias úteis. Compensação em até 48h.</p>
                                    </div>
                                </section>
                            )}
                        </div>

                        <footer className="p-6 bg-gray-50 border-t">
                            <Button
                                onClick={() => setIsPaymentModalOpen(false)}
                                variant="primary"
                                className="w-full"
                            >
                                Entendi
                            </Button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
