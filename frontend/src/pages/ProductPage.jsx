import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';
import { Loader2, ShoppingBag, ShieldCheck, Truck, RefreshCcw, ChevronLeft, Play, X, Maximize2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import ReviewSection from '../components/ReviewSection';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

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
            {/* Thumbnails Verticais */}
            {product.images?.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setMainMedia(img)}
                    className={`aspect-square bg-white overflow-hidden shadow-sm transition-all cursor-pointer relative rounded-sm ${mainMedia === img ? 'ring-2 ring-[var(--dourado-suave)]' : 'opacity-60 hover:opacity-100'}`}
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
              <div className="space-y-2">
                <span className="font-lato text-[11px] uppercase tracking-[0.4em] text-[var(--dourado-suave)] block">Coleção Sagrada</span>
                <h1 className="font-playfair text-3xl md:text-5xl text-[var(--azul-profundo)] leading-snug">{product.name}</h1>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex flex-col">
                    {hasDiscount && (
                      <span className="font-lato text-sm text-gray-400 line-through">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice || 0)}
                      </span>
                    )}
                    <span className="font-lato text-3xl text-[var(--dourado-suave)] font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <span className="bg-green-600 text-white px-3 py-1 rounded-sm font-lato text-xs font-bold shadow-sm">
                      {discountPercentage}% OFF
                    </span>
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

              {/* Quantidade e Comprar */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center justify-between border border-gray-200 w-full sm:w-32 bg-white rounded-sm h-14">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-gray-50 text-[var(--azul-profundo)]">-</button>
                  <span className="font-lato text-[var(--azul-profundo)]">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full hover:bg-gray-50 text-[var(--azul-profundo)]">+</button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 h-14 py-4 px-8 font-lato text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded-sm shadow-sm
                      ${isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-[var(--azul-profundo)] text-white hover:bg-[#1a3a5a] hover:shadow-lg active:scale-[0.98]'
                    }
                  `}
                >
                  <ShoppingBag size={18} />
                  {isOutOfStock ? 'Indisponível' : 'Adicionar à Sacola'}
                </button>
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

          {/* Placeholder para Produtos Relacionados */}
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="font-playfair text-3xl text-[var(--azul-profundo)] mb-2 uppercase tracking-[0.2em]">Você também vai amar</h2>
              <div className="h-1 w-24 bg-[#C9A24D] mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Aqui entrará o componente de listagem de relacionados futuramente */}
              <p className="col-span-full text-center text-gray-400 font-lato text-xs uppercase tracking-widest">Carregando Recomendações...</p>
            </div>
          </section>

          {/* Seção de Avaliações */}
          <section id="avaliacoes" className="border-t border-[var(--azul-profundo)]/10 pt-24">
            <ReviewSection productId={product.id} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
