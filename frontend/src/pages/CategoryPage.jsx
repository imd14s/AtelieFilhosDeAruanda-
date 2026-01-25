import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { wixClient } from '../utils/wixClient';
import ProductCard from '../components/ProductCard';
import { Loader2, ChevronLeft, Sparkles, Wind } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams(); // Pega o slug da URL (ex: velas, guias, ervas)
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        // 1. Busca os dados da coleção (Nome, Descrição, Imagem de Capa)
        const collectionResponse = await wixClient.collections.getCollectionBySlug(slug);
        const currentCollection = collectionResponse.collection;
        setCollection(currentCollection);

        // 2. Busca produtos que pertencem a esta coleção específica
        const productsResponse = await wixClient.products
          .queryProducts()
          .hasSome('collectionIds', [currentCollection._id])
          .limit(50)
          .find();

        setProducts(productsResponse.items);
      } catch (error) {
        console.error("Erro ao carregar categoria:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F7F7F4] gap-4">
        <Loader2 className="animate-spin text-[#C9A24D]" size={32} />
        <span className="font-lato text-[10px] uppercase tracking-[0.3em] text-[#0f2A44]">Sintonizando energias...</span>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F4] p-4 text-center">
        <h2 className="font-playfair text-2xl text-[#0f2A44] mb-4">Categoria não encontrada</h2>
        <Link to="/loja" className="text-[#C9A24D] font-lato text-xs uppercase tracking-widest border-b border-[#C9A24D]">Voltar para a Loja</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F4] min-h-screen">
      {/* HEADER DINÂMICO DA CATEGORIA */}
      <header className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-[#0f2A44]">
        {/* Imagem de Fundo da Categoria (vinda do Wix) */}
        {collection.media?.mainMedia?.image?.url ? (
          <img 
            src={collection.media.mainMedia.image.url} 
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2A44] to-[#1a4163]"></div>
        )}
        
        <div className="relative z-10 text-center px-4 space-y-4">
          <Link to="/loja" className="inline-flex items-center gap-2 text-[#C9A24D] hover:text-[#F7F7F4] transition-colors mb-4">
            <ChevronLeft size={16} />
            <span className="font-lato text-[10px] uppercase tracking-widest">Todos os Produtos</span>
          </Link>
          <h1 className="font-playfair text-5xl md:text-7xl text-[#F7F7F4] capitalize italic">
            {collection.name}
          </h1>
          <div className="flex items-center justify-center gap-4">
             <div className="h-[1px] w-12 bg-[#C9A24D]/50"></div>
             <Sparkles size={16} className="text-[#C9A24D]" />
             <div className="h-[1px] w-12 bg-[#C9A24D]/50"></div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        
        {/* DESCRIÇÃO DA CATEGORIA */}
        {collection.description && (
          <div className="max-w-3xl mx-auto text-center mb-20">
            <p className="font-lato text-base md:text-lg text-[#0f2A44]/70 leading-relaxed italic">
              "{collection.description}"
            </p>
          </div>
        )}

        {/* GRID DE PRODUTOS */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
              <div key={product._id} className="animate-fade-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 border border-dashed border-[#0f2A44]/10 rounded-lg">
            <Wind className="mx-auto text-[#0f2A44]/20 mb-4" size={40} />
            <p className="font-lato text-[11px] uppercase tracking-widest text-[#0f2A44]/40">
              Nenhum item disponível nesta categoria no momento.
            </p>
          </div>
        )}
      </section>

      {/* FOOTER DE NAVEGAÇÃO RÁPIDA */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="border-t border-[#0f2A44]/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <h4 className="font-playfair text-[#0f2A44]/40 text-lg uppercase tracking-widest">Explorar Outras Vertentes</h4>
            <div className="flex gap-8">
                <Link to="/categoria/velas" className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44] hover:text-[#C9A24D] transition-colors">Velas</Link>
                <Link to="/categoria/guias" className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44] hover:text-[#C9A24D] transition-colors">Guias</Link>
                <Link to="/categoria/ervas" className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44] hover:text-[#C9A24D] transition-colors">Ervas</Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;