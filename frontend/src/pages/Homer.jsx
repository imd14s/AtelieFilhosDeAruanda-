import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { storeService } from '../services/storeService';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await storeService.getProducts();
        setFeaturedProducts(items.slice(0, 4));
      } catch (error) {
        console.error("Erro ao carregar destaques:", error);
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
      <SEO
        title="Bem-vindo ao Axé"
        description="Velas artesanais, guias personalizadas e ervas sagradas. O melhor do artesanato religioso com a qualidade do Ateliê Filhos de Aruanda."
      />
      <Hero />

      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.path} className="group relative overflow-hidden aspect-[4/5] shadow-sm">
              <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2A44]/90 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-12">
                <h3 className="font-playfair text-3xl text-[#F7F7F4]">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-24 border-y border-[#0f2A44]/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-playfair text-4xl text-[#0f2A44] mb-16 text-center">Destaques do Ateliê</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C9A24D]" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
