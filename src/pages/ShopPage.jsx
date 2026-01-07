import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { wixClient } from '../utils/wixClient';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { Loader2, SlidersHorizontal, LayoutGrid, X } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('categoria');
  const sortFilter = searchParams.get('sort') || 'newest';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 1. Carregar Coleções do Wix
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        if (wixClient.collections) {
          const { items } = await wixClient.collections.queryCollections().find();
          setCollections(items);
        }
      } catch (err) {
        console.error("Erro ao carregar coleções:", err);
      }
    };
    fetchCollections();
  }, []);

  // 2. Carregar Produtos com Filtro e Ordenação Corrigida
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = wixClient.products.queryProducts();

        // Filtro de Categoria
        if (categoryFilter) {
          const { collection } = await wixClient.collections.getCollectionBySlug(categoryFilter);
          if (collection) {
            query = query.hasSome('collectionIds', [collection._id]);
          }
        }

        /** * CORREÇÃO DO ERRO 400:
         * O campo de ordenação correto para o Wix Stores é 'priceData.price'
         */
        if (sortFilter === 'price_asc') {
          query = query.ascending('priceData.price');
        } else if (sortFilter === 'price_desc') {
          query = query.descending('priceData.price');
        } else {
          query = query.descending('_createdDate'); // Ordena por data de criação
        }

        const { items } = await query.find();
        setProducts(items);
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
        collections={collections}
        activeCategory={categoryFilter}
        onSelectCategory={(slug) => {
          const params = new URLSearchParams(searchParams);
          if (slug) params.set('categoria', slug);
          else params.delete('categoria');
          setSearchParams(params);
        }}
        activeSort={sortFilter}
        onSelectSort={(val) => {
          const params = new URLSearchParams(searchParams);
          params.set('sort', val);
          setSearchParams(params);
        }}
      />

      <div className="bg-[#0f2A44] text-[#F7F7F4] py-16 md:py-24 px-4 text-center">
        <span className="font-lato text-[10px] uppercase tracking-[0.5em] text-[#C9A24D] mb-4 block">
          Catálogo Completo
        </span>
        <h1 className="font-playfair text-4xl md:text-6xl mb-6 italic">Loja de Axé</h1>
        <div className="w-20 h-[1px] bg-[#C9A24D] mx-auto opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <aside className="hidden lg:block w-64 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-6 text-[#0f2A44]">
                <SlidersHorizontal size={18} />
                <h2 className="font-playfair text-xl">Coleções</h2>
              </div>
              
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={clearFilters}
                    className={`font-lato text-sm uppercase tracking-widest transition-colors ${!categoryFilter ? 'text-[#C9A24D] font-bold' : 'text-[#0f2A44]/60 hover:text-[#0f2A44]'}`}
                  >
                    Todos os Itens
                  </button>
                </li>
                {collections.map((col) => (
                  <li key={col._id}>
                    <button 
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.set('categoria', col.slug);
                        setSearchParams(p);
                      }}
                      className={`font-lato text-sm uppercase tracking-widest transition-colors ${categoryFilter === col.slug ? 'text-[#C9A24D] font-bold' : 'text-[#0f2A44]/60 hover:text-[#0f2A44]'}`}
                    >
                      {col.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 border-t border-[#0f2A44]/5">
              <h3 className="font-playfair text-xl text-[#0f2A44] mb-4">Ordenar</h3>
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
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#0f2A44]/10">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#0f2A44] text-[#0f2A44] font-lato text-[10px] uppercase tracking-widest"
              >
                <SlidersHorizontal size={14} /> Filtros
              </button>
              
              <div className="hidden sm:flex items-center gap-2 text-[#0f2A44]/50">
                <LayoutGrid size={16} />
                <span className="font-lato text-[10px] uppercase tracking-widest">
                  {products.length} itens encontrados
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
                <p className="font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/40">Buscando o Axé...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 gap-y-12 animate-fade-in">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/50 border border-dashed border-[#0f2A44]/10">
                <h3 className="font-playfair text-2xl text-[#0f2A44] mb-2">Nenhum item disponível</h3>
                <p className="font-lato text-sm text-[#0f2A44]/50">Tente outra categoria ou limpe os filtros.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;