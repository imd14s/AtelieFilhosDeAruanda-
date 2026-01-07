import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { wixClient } from '../utils/wixClient';
import { getWixImageUrl } from '../utils/mediaUtils';
import { Plus, Minus, ShoppingBag, ShieldCheck, Truck, Loader2, Sparkles } from 'lucide-react';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Busca o produto pelo slug usando o SDK do Wix
        const { items } = await wixClient.products.queryProducts().eq('slug', slug).find();
        if (items.length > 0) setProduct(items[0]);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await wixClient.currentCart.addToCurrentCart({
        lineItems: [{
          catalogReference: {
            appId: '1380b703-ce81-ff05-f115-39571d94dfcd',
            catalogItemId: product._id,
          },
          quantity: quantity,
        }],
      });
      alert(`O axé de ${product.name} foi adicionado ao seu carrinho!`);
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar ao carrinho.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F4] gap-4">
      <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      <span className="font-lato text-xs uppercase tracking-[0.3em] text-[#0f2A44]">Preparando o Altar...</span>
    </div>
  );

  if (!product) return <div className="min-h-screen flex items-center justify-center font-playfair bg-[#F7F7F4]">Produto não encontrado.</div>;

  // Galeria de imagens
  const images = product.media?.items || [];

  return (
    <div className="bg-[#F7F7F4] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LADO ESQUERDO: Galeria (5 colunas) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Miniaturas */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide">
              {images.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveImg(index)}
                  className={`relative flex-shrink-0 w-20 h-20 border-2 transition-all ${activeImg === index ? 'border-[#C9A24D]' : 'border-transparent opacity-60'}`}
                >
                  <img src={getWixImageUrl(item.image?.url, 100, 100)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            {/* Imagem Principal */}
            <div className="flex-1 aspect-[4/5] bg-white border border-[#0f2A44]/5 shadow-sm overflow-hidden">
              <img 
                src={getWixImageUrl(images[activeImg]?.image?.url, 800, 1000)} 
                alt={product.name} 
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>
          </div>

          {/* LADO DIREITO: Info (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-[#C9A24D]" />
              <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[#C9A24D]">Produto Exclusivo</span>
            </div>

            <h1 className="font-playfair text-4xl md:text-5xl text-[#0f2A44] mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              <span className="font-lato text-2xl font-bold text-[#0f2A44]">
                {product.priceData?.formatted?.price}
              </span>
              {product.priceData?.price !== product.priceData?.discountedPrice && (
                <span className="font-lato text-lg text-[#0f2A44]/30 line-through">
                  {product.priceData?.formatted?.onSalePrice}
                </span>
              )}
            </div>

            {/* Descrição curta ou Rich Text do Wix */}
            <div 
              className="prose prose-slate font-lato text-sm text-[#0f2A44]/70 mb-10 leading-relaxed border-l-2 border-[#C9A24D]/20 pl-6"
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />

            {/* Ações */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-[#0f2A44]/20 h-14 bg-white">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-5 h-full hover:bg-[#0f2A44]/5 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-lato font-bold w-12 text-center text-[#0f2A44]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-5 h-full hover:bg-[#0f2A44]/5 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock?.inventoryStatus === 'OUT_OF_STOCK'}
                  className="flex-1 bg-[#0f2A44] text-[#F7F7F4] h-14 font-lato text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#C9A24D] transition-all duration-500 shadow-xl disabled:bg-slate-300"
                >
                  {addingToCart ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
                  {product.stock?.inventoryStatus === 'OUT_OF_STOCK' ? 'Esgotado' : 'Consagrar e Comprar'}
                </button>
              </div>
            </div>

            {/* Selos de Confiança */}
            <div className="mt-12 space-y-4 pt-8 border-t border-[#0f2A44]/5">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-[#C9A24D]/10 flex items-center justify-center text-[#C9A24D]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44] font-bold">Artesanato com Intenção</h4>
                  <p className="font-lato text-[10px] text-[#0f2A44]/50">Feito à mão respeitando preceitos ancestrais.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C9A24D]/10 flex items-center justify-center text-[#C9A24D]">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44] font-bold">Envio Seguro</h4>
                  <p className="font-lato text-[10px] text-[#0f2A44]/50">Embalagem cuidadosa para garantir a integridade.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Extras / Adicionais */}
        {product.additionalInfoSections?.length > 0 && (
          <div className="mt-24 pt-20 border-t border-[#0f2A44]/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {product.additionalInfoSections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-playfair text-xl text-[#0f2A44] mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#C9A24D] rounded-full"></div>
                    {section.title}
                  </h3>
                  <div 
                    className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.description }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;