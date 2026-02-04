import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';
import { Loader2, ShoppingBag, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const data = await storeService.getProductBySlug(id);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    storeService.cart.add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F7F7F4]">
      <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      <p className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/40">Carregando Axé...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F4]">
      <p className="font-playfair text-xl text-[#0f2A44]">Produto não encontrado.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7F4] pt-8 pb-20 px-4">
      <SEO
        title={product.name}
        description={product.description?.substring(0, 160)}
        image={product.images?.[0]}
        type="product"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* Galeria de Imagens */}
          <div className="flex-1 space-y-4">
            <div className="aspect-[4/5] bg-white overflow-hidden shadow-sm">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/800'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.slice(1).map((img, i) => (
                <div key={i} className="aspect-square bg-white overflow-hidden shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info do Produto */}
          <div className="flex-1 flex flex-col">
            <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[#C9A24D] mb-4 block">
              Coleção Ateliê Aruanda
            </span>
            <h1 className="font-playfair text-4xl md:text-5xl text-[#0f2A44] mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <span className="font-lato text-2xl font-bold text-[#0f2A44]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
              <div className="h-4 w-[1px] bg-[#0f2A44]/10"></div>
              <span className="font-lato text-[10px] uppercase tracking-widest text-green-700">
                {product.stockQuantity > 0 ? 'Em estoque' : 'Sob encomenda'}
              </span>
            </div>

            <div className="prose prose-sm font-lato text-[#0f2A44]/70 mb-10 border-t border-[#0f2A44]/5 pt-8">
              <p className="leading-relaxed">{product.description}</p>
            </div>

            {/* Ações */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-[#0f2A44]/20 bg-white">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-[#0f2A44]">-</button>
                  <span className="px-6 font-lato font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-[#0f2A44]">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 font-lato text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${added ? 'bg-green-700 text-white' : 'bg-[#0f2A44] text-white hover:bg-[#C9A24D]'
                    }`}
                >
                  <ShoppingBag size={18} />
                  {added ? 'Adicionado com Sucesso' : 'Adicionar à Sacola'}
                </button>
              </div>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#0f2A44]/5">
              <div className="flex items-center gap-3 opacity-60">
                <ShieldCheck size={20} className="text-[#C9A24D]" />
                <span className="font-lato text-[9px] uppercase tracking-widest leading-tight">Produção Artesanal Ritualizada</span>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <Truck size={20} className="text-[#C9A24D]" />
                <span className="font-lato text-[9px] uppercase tracking-widest leading-tight">Envio Seguro para todo Brasil</span>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <RefreshCcw size={20} className="text-[#C9A24D]" />
                <span className="font-lato text-[9px] uppercase tracking-widest leading-tight">Devolução em até 7 dias</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductPage;
