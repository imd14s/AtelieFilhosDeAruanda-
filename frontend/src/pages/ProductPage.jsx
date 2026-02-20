import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';
import { Loader2, ShoppingBag, ShieldCheck, Truck, RefreshCcw, ChevronLeft, Play } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [mainMedia, setMainMedia] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

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

  const renderMedia = (url, isMain) => {
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
        src={getImageUrl(url)}
        alt={product?.name || "Produto"}
        onError={(e) => { e.target.src = '/images/default.png'; }}
        className="w-full h-full object-cover"
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
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb Otimizado */}
        <Link to="/store" className="inline-flex items-center gap-2 text-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)] mb-8 transition-colors">
          <ChevronLeft size={16} />
          <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]">Voltar para a Loja</span>
        </Link>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Galeria de Imagens/Vídeos */}
          <div className="flex-1 space-y-4 w-full">
            <div className="aspect-[4/5] bg-white overflow-hidden shadow-sm relative rounded-sm">
              {renderMedia(mainMedia, true)}
              {!mainMedia && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="font-playfair text-[var(--azul-profundo)]/30 text-xl font-bold uppercase tracking-widest text-center">Imagem<br />Indisponível</span>
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setMainMedia(img)}
                    className={`aspect-square bg-white overflow-hidden shadow-sm transition-all cursor-pointer relative rounded-sm ${mainMedia === img ? 'opacity-100 ring-2 ring-[var(--dourado-suave)]' : 'opacity-60 hover:opacity-100'}`}
                  >
                    {renderMedia(img, false)}
                    {isVideo(img) && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                        <div className="bg-black/50 rounded-full p-2">
                          <Play size={12} className="text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info do Produto */}
          <div className="flex-1 flex flex-col pt-4 lg:pt-0 w-full">
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[var(--dourado-suave)] block">Arte e Fé</span>
                <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[var(--azul-profundo)] leading-tight">{product.name}</h1>
                <p className="font-lato text-2xl lg:text-3xl text-[var(--dourado-suave)] mt-2">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
                </p>

                {displayStock <= 5 && displayStock > 0 && (
                  <p className="text-xs text-amber-600 font-lato mt-2">Restam apenas {displayStock} unidades!</p>
                )}
                {isOutOfStock && (
                  <p className="text-xs font-bold text-red-600 font-lato mt-2">Produto Esgotado</p>
                )}
              </div>

              {/* Variantes */}
              {Object.keys(availableAttributes).length > 0 && (
                <div className="space-y-6 pt-6 border-t border-[var(--azul-profundo)]/10">
                  {Object.entries(availableAttributes).map(([key, options]) => (
                    <div key={key} className="space-y-3">
                      <span className="font-lato text-[11px] uppercase tracking-widest text-[var(--azul-profundo)]/80 block">{key}</span>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {options.map(opt => {
                          const isSelected = selectedOptions[key] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleOptionSelect(key, opt)}
                              className={`min-w-[3rem] px-4 py-2 border font-lato text-xs md:text-sm transition-all rounded-sm
                                                ${isSelected
                                  ? 'border-[var(--dourado-suave)] bg-[var(--dourado-suave)] text-white shadow-md'
                                  : 'border-gray-200 text-gray-600 hover:border-[var(--azul-profundo)] hover:text-[var(--azul-profundo)] bg-white'
                                }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="prose prose-sm md:prose-base font-lato text-[var(--azul-profundo)]/80 leading-relaxed border-t border-[var(--azul-profundo)]/10 pt-6 mt-6 whitespace-pre-line">
                <p className="italic">"{product.description}"</p>
              </div>

              {/* Ações */}
              <div className="space-y-6 mb-8 mt-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center justify-between border border-[var(--azul-profundo)]/20 w-full sm:w-1/3 bg-white rounded-sm h-14">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 h-full hover:bg-[var(--branco-off-white)] transition-colors text-lg text-[var(--azul-profundo)]">-</button>
                    <span className="px-4 font-lato min-w-[40px] text-center text-[var(--azul-profundo)]">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-5 h-full hover:bg-[var(--branco-off-white)] transition-colors text-lg text-[var(--azul-profundo)]">+</button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full sm:w-2/3 h-14 py-4 px-6 font-lato text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group rounded-sm shadow-md
                        ${isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[var(--azul-profundo)] text-white hover:bg-[var(--dourado-suave)] hover:shadow-xl'
                      }
                    `}
                  >
                    <ShoppingBag size={18} className={isOutOfStock ? "" : "group-hover:scale-110 transition-transform"} />
                    {isOutOfStock ? 'Indisponível' : 'Adicionar à Sacola'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 border-t border-[var(--azul-profundo)]/10">
                <div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0 p-3 bg-white/50 border border-[var(--azul-profundo)]/5 rounded-sm">
                  <Truck size={20} className="text-[var(--dourado-suave)] sm:mb-2 shrink-0" />
                  <span className="text-[9px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/70 text-left sm:text-center">Envio para todo o Brasil</span>
                </div>
                <div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0 p-3 bg-white/50 border border-[var(--azul-profundo)]/5 rounded-sm">
                  <ShieldCheck size={20} className="text-[var(--dourado-suave)] sm:mb-2 shrink-0" />
                  <span className="text-[9px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/70 text-left sm:text-center">Compra totalmente Segura</span>
                </div>
                <div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0 p-3 bg-white/50 border border-[var(--azul-profundo)]/5 rounded-sm">
                  <RefreshCcw size={20} className="text-[var(--dourado-suave)] sm:mb-2 shrink-0" />
                  <span className="text-[9px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/70 text-left sm:text-center">Devolução em até 7 dias</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductPage;
