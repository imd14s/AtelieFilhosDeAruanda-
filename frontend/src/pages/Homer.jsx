import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import ProductionNotice from '../components/ProductionNotice';
import SEO from '../components/SEO';
import { storeService } from '../services/storeService';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await storeService.getProducts();
        setFeaturedProducts(items.slice(0, 7));
      } catch (error) {
        console.error("Erro ao carregar destaques:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="bg-[var(--branco-off-white)] min-h-screen">
      <SEO
        title="Bem-vindo ao Axé"
        description="Velas artesanais, guias personalizadas e ervas sagradas. O melhor do artesanato religioso com a qualidade do Ateliê Filhos de Aruanda."
      />
      <Hero />

      <ProductionNotice />

      {/* Destaques do Ateliê */}
      <section className="bg-white py-24 border-y border-[var(--azul-profundo)]/5">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-16 text-center">Destaques do Ateliê</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--dourado-suave)]" size={32} /></div>
          ) : (
            <ProductCarousel products={featuredProducts.slice(0, 7)} />
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
