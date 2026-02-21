import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storeService } from '../services/storeService';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SEO from '../components/SEO';
import { Loader2, SlidersHorizontal, LayoutGrid } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('categoria');
  const sortFilter = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Map frontend sort keys to backend Sort format (property,direction)
        let mappedSort = sortFilter;
        if (sortFilter === 'newest') mappedSort = 'createdAt,desc';
        else if (sortFilter === 'price_asc') mappedSort = 'price,asc';
        else if (sortFilter === 'price_desc') mappedSort = 'price,desc';

        const [prodData, catData] = await Promise.all([
          storeService.getProducts({
            category: categoryFilter,
            sort: mappedSort
          }),
          storeService.getCategories()
        ]);

        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryFilter, sortFilter]);


  return (
    <div className="min-h-screen bg-[var(--branco-off-white)] pb-20">
      <SEO
        title={categoryFilter ? `Coleção ${categoryFilter}` : "Loja de Artigos Religiosos"}
        description="Explore nossa seleção de velas, guias e produtos artesanais para sua espiritualidade."
      />
      <FilterSidebar
        isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}
        collections={categories.map(c => ({ _id: c.id, name: c.name, slug: c.id }))}
        activeCategory={categoryFilter}
        onSelectCategory={(id) => {
          const p = new URLSearchParams(searchParams);
          id ? p.set('categoria', id) : p.delete('categoria');
          setSearchParams(p);
        }}
      />
      <div className="bg-[var(--azul-profundo)] text-[var(--branco-off-white)] py-12 text-center">
        <h1 className="font-playfair text-4xl italic">Loja de Axé</h1>
      </div>
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <button onClick={() => setIsFilterOpen(true)} className="lg:hidden mb-4 border p-2 text-xs uppercase">Filtros</button>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--dourado-suave)]" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 border border-dashed border-[var(--azul-profundo)]/10 rounded-lg flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--azul-profundo)]/5 rounded-full flex items-center justify-center mb-4">
              <LayoutGrid className="text-[var(--azul-profundo)]/20" size={32} />
            </div>
            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)] mb-2">Nenhum Axé encontrado</h2>
            <p className="font-lato text-sm text-[var(--azul-profundo)]/60 mb-8 max-w-xs">
              Não encontramos itens que correspondam aos seus filtros no momento.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setIsFilterOpen(false);
              }}
              className="font-lato text-[10px] uppercase tracking-widest text-[var(--azul-profundo)] border-b border-[var(--azul-profundo)] hover:text-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
export default ShopPage;
