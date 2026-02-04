import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import SEO from '../components/SEO';
import { Loader2, ShoppingBag, ShieldCheck, Truck, RefreshCcw, ChevronLeft } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const data = await storeService.getProductById(id);
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
    <div className="min-h-screen bg-[var(--branco-off-white)] pt-12 pb-24">
      <SEO
        title={product.name}
        description={product.description?.substring(0, 160)}
        image={product.images?.[0]}
        type="product"
      />
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb Otimizado */}
        <Link to="/store" className="inline-flex items-center gap-2 text-[var(--azul-profundo)]/40 hover:text-[var(--azul-profundo)] mb-12 transition-colors">
          <ChevronLeft size={16} />
          <span className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)]">Voltar para a Loja</span>
        </Link>
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
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[var(--dourado-suave)] block">Arte e Fé</span>
                <h1 className="font-playfair text-4xl md:text-5xl text-[var(--azul-profundo)] leading-tight">{product.name}</h1>
                <p className="font-lato text-2xl text-[var(--dourado-suave)]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
              </div>

              <div className="prose prose-sm font-lato text-[var(--azul-profundo)]/70 leading-relaxed border-t border-[var(--azul-profundo)]/5 pt-8">
                <p className="italic">"{product.description}"</p>
              </div>

              {/* Ações */}
              <div className="space-y-6 mb-12">
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center border border-[var(--azul-profundo)]/10 w-fit bg-white rounded-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-[var(--branco-off-white)] transition-colors">-</button>
                    <span className="px-4 font-lato min-w-[40px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-[var(--branco-off-white)] transition-colors">+</button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[var(--azul-profundo)] text-white py-5 px-8 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[var(--dourado-suave)] transition-all flex items-center justify-center gap-3 group rounded-sm shadow-xl"
                  >
                    <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                    Adicionar à Sacola
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-12 border-t border-[var(--azul-profundo)]/5 mt-12">
                <div className="flex flex-col items-center p-4 bg-white/50 border border-[var(--azul-profundo)]/5 rounded-sm">
                  <Truck size={24} className="text-[var(--dourado-suave)] mb-2" />
                  <span className="text-[10px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/60 text-center">Envio para todo o Brasil</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/50 border border-[var(--azul-profundo)]/5 rounded-sm">
                  <ShieldCheck size={24} className="text-[var(--dourado-suave)] mb-2" />
                  <span className="text-[10px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/60 text-center">Compra totalmente Segura</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/50 border border-[var(--azul-profundo)]/5 rounded-sm">
                  <RefreshCcw size={24} className="text-[var(--dourado-suave)] mb-2" />
                  <span className="text-[10px] uppercase font-lato tracking-widest text-[var(--azul-profundo)]/60 text-center">Devolução em até 7 dias</span>
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
