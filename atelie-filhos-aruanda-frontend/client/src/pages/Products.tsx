import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');

  const { data: categories } = trpc.categories.list.useQuery();

  const { data: products, isLoading } = trpc.products.list.useQuery({
    search: searchQuery || undefined,
    categoryId: selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    limit: 50,
  });

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => parseFloat(a.basePrice) - parseFloat(b.basePrice));
      case 'price-desc':
        return sorted.sort((a, b) => parseFloat(b.basePrice) - parseFloat(a.basePrice));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [products, sortBy]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search" className="mb-2 block">Buscar</Label>
        <Input
          id="search"
          type="search"
          placeholder="Nome do produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <Label className="mb-2 block">Categoria</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="mb-3 block">
          Faixa de Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
        </Label>
        <Slider
          min={0}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-2"
        />
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setPriceRange([0, 1000]);
        }}
      >
        Limpar Filtros
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Nossos Produtos</h1>
            <p className="text-muted-foreground">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="elegant-card p-6 sticky top-24">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filtros
                </h2>
                <FilterPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filters & Sort */}
              <div className="flex items-center justify-between mb-6 gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Label htmlFor="sort" className="text-sm whitespace-nowrap">Ordenar por:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sort" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recentes</SelectItem>
                      <SelectItem value="price-asc">Menor preço</SelectItem>
                      <SelectItem value="price-desc">Maior preço</SelectItem>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="elegant-card p-4">
                      <Skeleton className="w-full aspect-square mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setPriceRange([0, 1000]);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <Link key={product.id} href={`/produto/${product.slug}`}>
                      <a className="product-card block">
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <Sparkles className="h-16 w-16" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {product.shortDescription || product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary">
                              R$ {parseFloat(product.basePrice).toFixed(2)}
                            </span>
                            <Button size="sm" variant="ghost">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
