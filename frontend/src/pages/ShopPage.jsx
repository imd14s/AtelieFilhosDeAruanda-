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
        const [prodData, catData] = await Promise.all([
          storeService.getProducts(),
          storeService.getCategories()
        ]);

        let filtered = [...prodData];
        if (categoryFilter) {
          filtered = filtered.filter(p => p.category?.id === categoryFilter || p.category?.name === categoryFilter);
        }

        if (sortFilter === 'price_asc') filtered.sort((a, b) => a.price - b.price);
        else if (sortFilter === 'price_desc') filtered.sort((a, b) => b.price - a.price);

        setProducts(filtered);
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
    <div className="min-h-screen bg-[#F7F7F4] pb-20">
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
      <div className="bg-[#0f2A44] text-[#F7F7F4] py-12 text-center">
        <h1 className="font-playfair text-4xl italic">Loja de Axé</h1>
      </div>
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <button onClick={() => setIsFilterOpen(true)} className="lg:hidden mb-4 border p-2 text-xs uppercase">Filtros</button>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
};
export default ShopPage;
