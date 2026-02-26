import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import SEO from '../components/SEO';
import { Loader2, LayoutGrid } from 'lucide-react';
import { Product, Category } from '../types';

const ShopPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('categoria') || searchParams.get('categoryId');
    const sortFilter = searchParams.get('sort') || 'newest';

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

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
                    productService.getProducts({
                        category: categoryFilter || undefined,
                        sort: mappedSort
                    }),
                    productService.getCategories()
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
                title={categoryFilter ? `Coleção | ${categoryFilter}` : "Loja de Artigos Religiosos"}
                description="Explore nossa seleção de velas, guias e produtos artesanais para sua espiritualidade."
            />
            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                collections={categories.map(c => ({ ...c, slug: c.slug || c.id }))}
                activeCategory={categoryFilter}
                onSelectCategory={(slug) => {
                    const p = new URLSearchParams(searchParams);
                    if (slug) {
                        p.set('categoria', slug);
                    } else {
                        p.delete('categoria');
                    }
                    setSearchParams(p);
                }}
            />

            <div className="bg-[var(--azul-profundo)] text-[var(--branco-off-white)] py-12 text-center">
                <h1 className="font-playfair text-4xl italic">Loja de Axé</h1>
            </div>

            <main className="max-w-7xl mx-auto px-4 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="lg:hidden flex items-center gap-2 border border-[var(--azul-profundo)]/10 px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[var(--azul-profundo)] hover:text-white transition-all shadow-sm"
                    >
                        Filtros
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[var(--dourado-suave)]" size={32} />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white shadow-sm border border-[var(--azul-profundo)]/5 rounded-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-[var(--azul-profundo)]/5 rounded-full flex items-center justify-center mb-6">
                            <LayoutGrid className="text-[var(--azul-profundo)]/20" size={36} />
                        </div>
                        <h2 className="font-playfair text-3xl text-[var(--azul-profundo)] mb-3">Nenhum Axé encontrado</h2>
                        <p className="font-lato text-sm text-[var(--azul-profundo)]/60 mb-10 max-w-sm px-4">
                            Não encontramos itens que correspondam aos seus filtros no momento. Tente buscar por outra categoria.
                        </p>
                        <button
                            onClick={() => {
                                setSearchParams({});
                                setIsFilterOpen(false);
                            }}
                            className="font-lato text-[11px] uppercase tracking-[0.2em] text-[var(--azul-profundo)] px-8 py-4 border border-[var(--azul-profundo)] hover:bg-[var(--azul-profundo)] hover:text-white transition-all"
                        >
                            Limpar Todos os Filtros
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShopPage;
