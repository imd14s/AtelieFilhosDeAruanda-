import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';
import { useFavorites } from '../context/FavoritesContext';
import { ShoppingBag, ShieldCheck, Truck, RefreshCcw, ChevronLeft, Play, X, Maximize2, Heart } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useOutletContext();
  const { isFavorite: checkFavorite, toggleFavorite, loading: favLoading } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const { addToast } = useToast();

  const [mainMedia, setMainMedia] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

  const isFavorite = checkFavorite(id);

  const handleToggleFavorite = async () => {
    if (!product) return;
    await toggleFavorite(product);
  };

  // UI State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const mainImageRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await storeService.getProductById(id);
        setProduct(data);
        if (data?.images?.length > 0) {
          setMainMedia(data.images[0]);
        }

        // Registrar no histórico de navegação via API se o usuário estiver logado
        if (user?.id) {
          storeService.history.add(user.id, data.id);
        }

        if (data?.variants?.length > 0) {
          const firstActiveVariant = data.variants.find(v => v.active && v.stockQuantity > 0) || data.variants[0];
          if (firstActiveVariant && firstActiveVariant.attributesJson) {
            try {
              const attrs = JSON.parse(firstActiveVariant.attributesJson);
              setSelectedOptions(attrs);
              setCurrentVariant(firstActiveVariant);
              if (firstActiveVariant.imageUrl) setMainMedia(firstActiveVariant.imageUrl);
            } catch (e) { console.error("Error parsing variant attributes", e); }
          }
        }

        // Buscar recomendações
        setLoadingRecs(true);
        try {
          let recs = [];
          if (data?.categoryId) {
            recs = await storeService.getProducts({ categoryId: data.categoryId });
            recs = recs.filter(r => r.id !== id);
          }
          setRecommendations(recs.slice(0, 4));
        } catch (e) {
          console.error("Error fetching recommendations", e);
          // Fallback final
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
    const attrs = {};
    product.variants.forEach(variant => {
      if (!variant.active) return;
      try {
        const parsed = JSON.parse(variant.attributesJson || '{}');
        Object.entries(parsed).forEach(([key, value]) => {
          if (!attrs[key]) attrs[key] = new Set();
          attrs[key].add(value);
        });
      } catch (e) { }
    });
    Object.keys(attrs).forEach(k => attrs[k] = Array.from(attrs[k]));
    return attrs;
  }, [product]);

  // Mídias da variante selecionada (reage a mudança de currentVariant)
  const variantMedias = useMemo(() => {
    if (currentVariant) {
      const seen = new Set();
      const imgs = [];
      const addUnique = (url) => {
        if (url && !seen.has(url)) { seen.add(url); imgs.push(url); }
      };
      addUnique(currentVariant.imageUrl);
      (currentVariant.images || []).forEach(addUnique);
      // Se a variante não tiver nenhuma mídia própria, mostra só a 1ª imagem do produto
      return imgs.length > 0 ? imgs : (product?.images?.slice(0, 1) ?? []);
    }
    return product?.images ?? [];
  }, [currentVariant, product]);

  const handleOptionSelect = (key, value) => {
    const newOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(newOptions);

    if (product?.variants) {
      const matched = product.variants.find(v => {
        try {
          const attrs = JSON.parse(v.attributesJson || '{}');
          return Object.entries(newOptions).every(([k, val]) => attrs[k] === val);
        } catch (e) { return false; }
      });

      if (matched) {
        setCurrentVariant(matched);
        if (matched.imageUrl) setMainMedia(matched.imageUrl);
      } else {
        setCurrentVariant(null);
      }
    }
  };

  const displayPrice = currentVariant ? currentVariant.price : product?.price;
  const originalPrice = product?.originalPrice || displayPrice;
  const hasDiscount = originalPrice > displayPrice;
  const discountPercentage = product?.discountPercentage || (hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0);

  const displayStock = currentVariant ? currentVariant.stockQuantity : product?.stockQuantity;
  const isOutOfStock = displayStock <= 0;

  const handleReviewAdded = (newReview) => {
    // Atualização Otimista
    setProduct(prev => {
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

  // Calcula média a partir das reviews carregadas (mock ou reais)
  const handleReviewsLoaded = (loadedReviews) => {
    if (!loadedReviews?.length) return;
    const total = loadedReviews.length;
    const avg = loadedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
    setProduct(prev => ({
      ...prev,
      totalReviews: total,
      averageRating: parseFloat(avg.toFixed(1))
    }));
  };

  // Reseta quantidade ao trocar de variante (evita selecionar mais do que o novo estoque)
  useEffect(() => {
    setQuantity(1);
  }, [currentVariant?.id]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    const cartProduct = {
      ...product,
      id: currentVariant ? currentVariant.id : product.id,
      name: currentVariant ? `${product.name} (${Object.values(selectedOptions).join(', ')})` : product.name,
      price: displayPrice,
      images: currentVariant?.imageUrl ? [currentVariant.imageUrl] : product.images
    };

    storeService.cart.add(cartProduct, quantity);
    addToast(`${product.name} adicionado ao carrinho!`, "success");
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const isVideo = (url) => {
    if (!url) return false;
    const lower = String(url).toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
  };

  const handleMouseMove = (e) => {
    if (!mainImageRef.current || isVideo(mainMedia)) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const renderMedia = (url, isMain = false) => {
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
        onError={(e) => { e.target.src = '/images/default.png'; }}
        className="w-full h-full object-cover"
        onMouseMove={isMain ? handleMouseMove : null}
        onMouseLeave={isMain ? () => setZoomPos(prev => ({ ...prev, show: false })) : null}
        onClick={isMain ? () => setIsLightboxOpen(true) : null}
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
        image={product.images?.[0]}
        type="product"
      />

      {/* Lightbox Modal */}
      {isLightboxOpen && (
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
        {/* Breadcrumb / Botão Voltar */}
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
          {/* Mídia Seção (Esquerda) */}
          <div className="flex flex-row gap-4 flex-1">
            {/* Thumbnails Verticais – reage à variante selecionada */}
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

            {/* Imagem Principal com Zoom */}
            <div className="flex-1 relative group cursor-crosshair">
              <div className="aspect-[4/5] bg-white overflow-hidden shadow-sm relative rounded-sm overflow-hidden">
                {renderMedia(mainMedia, true)}

                {/* Overlay de Zoom */}
                {zoomPos.show && !isVideo(mainMedia) && (
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

              {/* Mobile Thumbs (Horizontal) */}
              <div className="flex md:hidden flex-row gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images?.map((img, i) => (
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

          {/* Info do Produto (Direita) */}
          <div className="flex-1 flex flex-col pt-4 lg:pt-0">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="font-playfair text-3xl md:text-[40px] text-[var(--azul-profundo)] leading-tight font-medium">
                  {product.name || 'Produto sem título'}
                </h1>

                {/* Estrelas e Qtd Avaliações com dados reais */}
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
                              const fill = Math.min(Math.max(avg - (star - 1), 0), 1); // 0, 0.5 ou 1
                              return (
                                <span key={star} className="relative inline-block w-4 h-4">
                                  {/* Estrela vazia (fundo) */}
                                  <svg className="w-4 h-4 text-gray-300 fill-gray-300 absolute inset-0" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {/* Estrela preenchida (clip) */}
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
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice || 0)}
                    </span>
                  )}
                  <div className="flex items-baseline gap-3">
                    <span className="font-lato text-[44px] text-[var(--azul-profundo)] font-bold leading-none">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
                    </span>
                    {hasDiscount && (
                      <span className="text-green-600 font-bold font-lato text-lg">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-lato text-[var(--azul-profundo)]">12x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice / 12)}</span>
                  <button className="text-[var(--azul-claro)] text-sm font-lato hover:underline text-left mt-1">Ver os meios de pagamento</button>
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

              {/* Seletor de Variantes: linha horizontal de miniaturas */}
              {product.variants && product.variants.length > 0 && (() => {
                // Atributos da variante selecionada para o label
                let selectedAttrs = {};
                try {
                  selectedAttrs = JSON.parse(currentVariant?.attributesJson || '{}');
                } catch { /* noop */ }

                // Filtra variantes ativas com imagem; usa fallback para todas as ativas
                const activeVariants = product.variants.filter(v => v.active !== false);

                return (
                  <div className="py-5 border-y border-gray-100 space-y-3">
                    {/* Label dos atributos selecionados */}
                    {Object.keys(selectedAttrs).length > 0 && (
                      <p className="font-lato text-sm text-gray-700">
                        {Object.entries(selectedAttrs).map(([k, v], i) => (
                          <span key={k}>
                            {i > 0 && <span className="mx-2 text-gray-300">·</span>}
                            <span className="font-semibold capitalize">{k}:</span>{' '}
                            <span className="font-bold uppercase tracking-wide text-[var(--azul-profundo)]">{v}</span>
                          </span>
                        ))}
                      </p>
                    )}

                    {/* Miniaturas horizontais – uma por variante */}
                    <div className="flex flex-row gap-2 overflow-x-auto pb-1">
                      {activeVariants.map((variant) => {
                        const isSelected = currentVariant?.id === variant.id;
                        const thumbSrc = variant.imageUrl
                          || product.images?.[0]
                          || '/images/default.png';

                        let variantAttrs = {};
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
                              if (variant.imageUrl) setMainMedia(variant.imageUrl);
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
                              onError={e => { e.target.src = '/images/default.png'; }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}


              {/* Quantidade e Comprar - Botões Duplos conforme Mockup */}
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-lato text-sm text-[var(--azul-profundo)]">Quantidade: <b>{quantity} {quantity > 1 ? 'unidades' : 'unidade'}</b></span>
                  <div className="flex flex-col border-l border-gray-200 pl-2">
                    {/* Incrementa apenas até o limite do stock disponível */}
                    <button
                      onClick={() => setQuantity(Math.min(displayStock || 1, quantity + 1))}
                      disabled={quantity >= (displayStock || 1)}
                      className="text-[var(--azul-claro)] hover:text-[var(--azul-profundo)] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} className="rotate-90" />
                    </button>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="text-[var(--azul-claro)] hover:text-[var(--azul-profundo)] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} className="-rotate-90" />
                    </button>
                  </div>
                  {/* Mostra quanto resta disponível após a seleção atual */}
                  {displayStock > 0 ? (
                    <span className="text-gray-400 text-xs ml-2">
                      ({Math.max(0, displayStock - quantity)} disponíve{displayStock - quantity === 1 ? 'l' : 'is'})
                    </span>
                  ) : (
                    <span className="text-red-400 text-xs ml-2">Sem estoque</span>
                  )}
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

                  <Button
                    onClick={handleToggleFavorite}
                    isLoading={favLoading}
                    variant="outline"
                    className={`w-full h-[58px] text-[16px] rounded-[4px] border
                        ${isFavorite
                        ? 'bg-white border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500'
                      }
                    `}
                  >
                    {!favLoading && <Heart size={24} className={isFavorite ? "fill-current" : ""} />}
                    {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  </Button>
                </div>
              </div>

              {/* Informações Extras */}
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

        {/* Seção Inferior: Descrição e Produtos Relacionados */}
        <div className="mt-24 space-y-24">
          <section className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)] mb-8 pb-4 border-b border-[var(--azul-profundo)]/10 text-center uppercase tracking-widest">Sobre este Axé</h2>
            <div className="prose prose-slate max-w-none font-lato text-[var(--azul-profundo)]/70 text-lg leading-relaxed text-center italic">
              {product.description}
            </div>
          </section>

          {/* Seção de Produtos Relacionados conforme mockup */}
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

          {/* Seção de Avaliações */}
          <section id="reviews" className="space-y-12 bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-sm">
            <ReviewSection
              productId={id}
              onReviewAdded={handleReviewAdded}
              onReviewsLoaded={handleReviewsLoaded}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
