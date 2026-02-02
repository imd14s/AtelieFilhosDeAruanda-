import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { wixClient } from '../utils/wixClient';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { Loader2, SlidersHorizontal, LayoutGrid } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('categoria');
  const sortFilter = searchParams.get('sort') || 'newest';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Carregar Produtos
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Busca simples usando nosso adaptador (API Java)
        const { items } = await wixClient.products.query().find();
        
        let filteredItems = [...items];

        // Filtro de Categoria (Simulado no Frontend por enquanto)
        if (categoryFilter) {
           // Lógica futura: filtrar por ID de coleção
           console.log("Filtrando por:", categoryFilter);
        }

        // Ordenação (Frontend)
        if (sortFilter === 'price_asc') {
          filteredItems.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
        } else if (sortFilter === 'price_desc') {
          filteredItems.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0));
        } 
        // 'newest' é o default que vem do banco

        setProducts(filteredItems);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, sortFilter]);

  const clearFilters = () => setSearchParams({});

  return (
    <div className="min-h-screen bg-[#F7F7F4] pb-20">
      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        activeCategory={categoryFilter}
        onSelectCategory={(slug) => {
          const params = new URLSearchParams(searchParams);
          slug ? params.set('categoria', slug) : params.delete('categoria');
          setSearchParams(params);
        }}
        activeSort={sortFilter}
        onSelectSort={(val) => {
          const params = new URLSearchParams(searchParams);
          params.set('sort', val);
          setSearchParams(params);
        }}
      />

      {/* Hero Header */}
      <div className="bg-[#0f2A44] text-[#F7F7F4] py-12 md:py-20 px-4 text-center">
        <span className="font-lato text-[10px] uppercase tracking-[0.5em] text-[#C9A24D] mb-4 block animate-fade-in">
          Catálogo Oficial
        </span>
        <h1 className="font-playfair text-4xl md:text-5xl mb-6 italic">Loja de Axé</h1>
        <div className="w-16 h-[1px] bg-[#C9A24D] mx-auto opacity-50"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 space-y-8 sticky top-24 h-fit">
            <div>
              <div className="flex items-center gap-2 mb-6 text-[#0f2A44]">
                <SlidersHorizontal size={18} />
                <h2 className="font-playfair text-xl">Filtros</h2>
              </div>
              
              <ul className="space-y-3">
                 <li>
                   <button onClick={clearFilters} className={`font-lato text-xs uppercase tracking-widest ${!categoryFilter ? 'text-[#C9A24D] font-bold' : 'text-[#0f2A44]/60 hover:text-[#0f2A44]'}`}>
                     Todos os Itens
                   </button>
                 </li>
                 {/* Categorias podem ser listadas dinamicamente aqui */}
              </ul>
            </div>

            <div className="pt-8 border-t border-[#0f2A44]/5">
              <h3 className="font-playfair text-lg text-[#0f2A44] mb-4">Ordenar</h3>
              <div className="space-y-2">
                {[
                  { label: 'Recentes', val: 'newest' },
                  { label: 'Menor Preço', val: 'price_asc' },
                  { label: 'Maior Preço', val: 'price_desc' }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      const p = new URLSearchParams(searchParams);
                      p.set('sort', opt.val);
                      setSearchParams(p);
                    }}
                    className={`block font-lato text-[11px] uppercase tracking-widest transition-all ${sortFilter === opt.val ? 'text-[#C9A24D]' : 'text-[#0f2A44]/40 hover:text-[#0f2A44]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {/* Toolbar Mobile */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#0f2A44]/10">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#0f2A44] text-[#0f2A44] font-lato text-[10px] uppercase tracking-widest"
              >
                <SlidersHorizontal size={14} /> Filtros
              </button>
              
              <div className="flex items-center gap-2 text-[#0f2A44]/50 ml-auto">
                <LayoutGrid size={16} />
                <span className="font-lato text-[10px] uppercase tracking-widest">
                  {products.length} axés encontrados
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
                <p className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/40">Buscando...</p>
              </div>
            ) : products.length > 0 ? (
              // GRID RESPONSIVO: 1 col (mobile), 2 cols (sm), 3 cols (xl), 4 cols (2xl)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10 animate-fade-in">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/50 border border-dashed border-[#0f2A44]/10">
                <h3 className="font-playfair text-2xl text-[#0f2A44] mb-2">Nada encontrado</h3>
                <p className="font-lato text-sm text-[#0f2A44]/50">Tente limpar os filtros.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
