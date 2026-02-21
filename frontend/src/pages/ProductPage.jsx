import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';
import { Loader2, ShoppingBag, ShieldCheck, Truck, RefreshCcw, ChevronLeft, Play, X, Maximize2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const [mainMedia, setMainMedia] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

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
        if (data?.categoryId) {
          setLoadingRecs(true);
          try {
            const recs = await storeService.getProducts({ categoryId: data.categoryId });
            // Filtrar o próprio produto e limitar a 4
            setRecommendations(recs.filter(r => r.id !== id).slice(0, 4));
          } catch (e) { console.error("Error fetching recommendations", e); }
          setLoadingRecs(false);
        }
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
      <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
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
    <div className="min-h-screen bg-[var(--branco-off-white)] pt-12 pb-24">
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

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb Otimizado */}
        <Link to="/store" className="inline-flex items-center gap-2 text-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)] mb-8 transition-colors">
          <ChevronLeft size={16} />
          <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]">Voltar para a Loja</span>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Mídia Seção (Esquerda) */}
          <div className="flex flex-row gap-4 flex-1">
            {/* Thumbnails Verticais (Filtrados por Variante se Cor selecionada) */}
            {(product.images?.length > 1 || product.variants?.length > 0) && (
              <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
                {(product.variants && selectedOptions['Cor']
                  ? product.variants.filter(v => {
                    try {
                      const attrs = JSON.parse(v.attributesJson || '{}');
                      return attrs['Cor'] === selectedOptions['Cor'] && v.imageUrl;
                    } catch (e) { return false; }
                  }).map(v => v.imageUrl)
                  : product.images || []
                ).map((img, i, arr) => (
                  <div
                    key={i}
                    onClick={() => setMainMedia(img)}
                    className={`aspect-square bg-white overflow-hidden shadow-sm transition-all cursor-pointer relative rounded-sm ${mainMedia === img ? 'ring-2 ring-[var(--azul-profundo)]' : 'opacity-60 hover:opacity-100'}`}
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
                <h1 className="font-playfair text-3xl md:text-[40px] text-[var(--azul-profundo)] leading-tight font-medium">{product.name}</h1>

                {/* Estrelas e Qtd Avaliações conforme mockup */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-lato text-gray-500">{product.averageRating || '4.6'}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-4 h-4 ${star <= Math.round(product.averageRating || 4.6) ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-lato text-gray-400">({product.totalReviews || '20752'})</span>
                </div>

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

              {/* Variantes com Imagens */}
              {Object.keys(availableAttributes).length > 0 && (
                <div className="space-y-6 py-6 border-y border-[var(--azul-profundo)]/10">
                  {Object.entries(availableAttributes).map(([key, options]) => (
                    <div key={key} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-lato text-[11px] uppercase tracking-widest text-[var(--azul-profundo)] font-bold">{key}: <span className="font-normal opacity-60 ml-2">{selectedOptions[key]}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {options.map(opt => {
                          const isSelected = selectedOptions[key] === opt;
                          // Tentar encontrar uma imagem para esta variante (se for cor)
                          const variantImg = product.variants?.find(v => {
                            try {
                              const attrs = JSON.parse(v.attributesJson || '{}');
                              return attrs[key] === opt && v.imageUrl;
                            } catch (e) { return false; }
                          })?.imageUrl;

                          return (
                            <button
                              key={opt}
                              onClick={() => handleOptionSelect(key, opt)}
                              className={`group relative transition-all duration-300 rounded-sm overflow-hidden
                                ${key.toLowerCase() === 'cor' && variantImg ? 'w-12 h-12' : 'px-5 py-2 min-w-[3rem] border'}
                                ${isSelected
                                  ? (variantImg ? 'ring-2 ring-[var(--azul-profundo)] ring-offset-2' : 'border-[var(--azul-profundo)] bg-[var(--azul-profundo)] text-white shadow-md')
                                  : (variantImg ? 'opacity-70 hover:opacity-100 ring-1 ring-gray-200' : 'border-gray-200 text-gray-600 hover:border-black bg-white')
                                }
                              `}
                            >
                              {key.toLowerCase() === 'cor' && variantImg ? (
                                <img src={getImageUrl(variantImg)} alt={opt} className="w-full h-full object-cover" />
                              ) : opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantidade e Comprar - Botões Duplos conforme Mockup */}
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-lato text-sm text-[var(--azul-profundo)]">Quantidade: <b>{quantity} unidade</b></span>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[var(--azul-claro)]"><ChevronLeft size={16} className="-rotate-90" /></button>
                  <span className="text-gray-400 text-xs">(+50 disponív...</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart();
                      // Redirecionar para checkout (simulado)
                      window.location.href = '/checkout';
                    }}
                    disabled={isOutOfStock}
                    className={`w-full h-[58px] font-lato text-[20px] font-medium transition-all flex items-center justify-center rounded-[4px] shadow-sm
                        ${isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#3483fa] text-white hover:bg-[#2968c8] active:scale-[0.99]'
                      }
                    `}
                  >
                    Comprar agora
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full h-[58px] font-lato text-[20px] font-medium transition-all flex items-center justify-center gap-3 rounded-[4px] shadow-sm
                        ${isOutOfStock
                        ? 'bg-gray-100/50 text-gray-300 cursor-not-allowed border border-gray-100'
                        : 'bg-[#e3edfb] text-[#3483fa] hover:bg-[#d0e1f9] active:scale-[0.99]'
                      }
                    `}
                  >
                    <ShoppingBag size={24} />
                    Adicionar ao carrinho
                  </button>
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
                <Loader2 className="animate-spin text-[#3483fa]" />
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
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
