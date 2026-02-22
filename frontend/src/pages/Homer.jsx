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
    { name: 'Velas', img: '/images/velas.png', path: '/store?categoria=velas' },
    { name: 'Guias', img: '/images/guias.png', path: '/store?categoria=guias' },
    { name: 'Ervas', img: '/images/ervas.png', path: '/store?categoria=ervas' },
  ];

  return (
    <div className="bg-[var(--branco-off-white)] min-h-screen">
      <SEO
        title="Bem-vindo ao Axé"
        description="Velas artesanais, guias personalizadas e ervas sagradas. O melhor do artesanato religioso com a qualidade do Ateliê Filhos de Aruanda."
      />
      <Hero />

      <section className="bg-white py-24 border-y border-[var(--azul-profundo)]/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-16 text-center">Destaques do Ateliê</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--dourado-suave)]" size={32} /></div>
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
