import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { wixClient } from '../utils/wixClient';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Buscamos os produtos diretamente usando a Query do Wix
        const { items } = await wixClient.products
          .queryProducts()
          .limit(4) // Limita aos 4 primeiros destaques
          .find();
        
        setFeaturedProducts(items);
      } catch (error) {
        console.error("Erro ao carregar produtos da Home:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = [
    { name: 'Velas', img: 'https://images.unsplash.com/photo-1603006905393-c36140d0469b?q=80&w=500', path: '/store?categoria=velas' },
    { name: 'Guias', img: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=500', path: '/store?categoria=guias' },
    { name: 'Ervas', img: 'https://images.unsplash.com/photo-1591185520173-097585800078?q=80&w=500', path: '/store?categoria=ervas' },
  ];

  return (
    <div className="bg-[#F7F7F4] min-h-screen">
      <Hero />

      {/* 2. CATEGORIAS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[#C9A24D]">Nossos Caminhos</span>
          <h2 className="font-playfair text-4xl text-[#0f2A44] mt-2">Nossas Vertentes</h2>
          <div className="w-12 h-[1px] bg-[#C9A24D] mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.path} className="group relative overflow-hidden aspect-[4/5] shadow-sm">
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2A44]/90 via-[#0f2A44]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="font-lato text-[10px] uppercase tracking-[0.3em] text-[#C9A24D] mb-2">Explorar</span>
                <h3 className="font-playfair text-3xl text-[#F7F7F4]">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PRODUTOS EM DESTAQUE (Vindos do Wix) */}
      <section className="bg-white py-24 border-y border-[#0f2A44]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-4">
            <div className="text-center md:text-left">
              <span className="font-lato text-[10px] uppercase tracking-[0.3em] text-[#C9A24D]">Sugestões de Axé</span>
              <h2 className="font-playfair text-4xl text-[#0f2A44] mt-2">Destaques do Ateliê</h2>
            </div>
            <Link 
              to="/store" 
              className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44] border-b border-[#0f2A44]/20 pb-1 hover:text-[#C9A24D] hover:border-[#C9A24D] transition-all"
            >
              Ver Toda Coleção
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#C9A24D]" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SEÇÃO "SOBRE" RÁPIDA */}
      <section className="py-32 px-4 bg-[#F7F7F4] relative overflow-hidden">
        {/* Detalhe Decorativo de Fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A24D]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <Sparkles className="mx-auto text-[#C9A24D] mb-8" size={40} strokeWidth={1} />
          <h2 className="font-playfair text-4xl text-[#0f2A44] mb-8">Tradição feita à mão</h2>
          <p className="font-lato text-base text-[#0f2A44]/70 leading-relaxed italic mb-12">
            "No Ateliê Filhos de Aruanda, cada guia é uma oração e cada vela é um ponto de luz. Não apenas vendemos objetos, entregamos axé em forma de arte para o seu terreiro ou para o seu altar doméstico."
          </p>
          <Link 
            to="/about"
            className="inline-block font-lato text-[10px] uppercase tracking-[0.4em] text-[#F7F7F4] bg-[#0f2A44] px-12 py-5 hover:bg-[#C9A24D] transition-all shadow-xl"
          >
            Conheça nossa História
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;