import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading } = trpc.products.list.useQuery({
    featured: true,
    limit: 6,
  });

  const { data: categories } = trpc.categories.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative gradient-overlay py-20 md:py-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Artesanato Afro-Brasileiro
                <span className="block text-gradient mt-2">Autêntico e Elegante</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Descubra peças únicas criadas com amor, respeito às tradições ancestrais 
                e a excelência do artesanato brasileiro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-base">
                  <Link href="/produtos">
                    <a className="flex items-center gap-2">
                      Ver Produtos
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link href="/sobre">
                    <a>Conheça Nossa História</a>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-y border-border bg-card">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Peças Únicas</h3>
                <p className="text-muted-foreground text-sm">
                  Cada produto é cuidadosamente criado à mão, garantindo exclusividade.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Compra Segura</h3>
                <p className="text-muted-foreground text-sm">
                  Pagamento protegido e garantia de satisfação em todas as compras.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Entrega Rápida</h3>
                <p className="text-muted-foreground text-sm">
                  Enviamos para todo o Brasil com rastreamento completo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Produtos em Destaque
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Conheça nossa seleção especial de peças que celebram a cultura e a arte afro-brasileira.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="elegant-card p-4">
                    <Skeleton className="w-full aspect-square mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts?.map((product) => (
                  <Link key={product.id} href={`/produto/${product.slug}`}>
                    <a className="product-card block">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {/* Placeholder for product image */}
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

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link href="/produtos">
                  <a>Ver Todos os Produtos</a>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Explore por Categoria
                </h2>
                <p className="text-muted-foreground text-lg">
                  Encontre o que você procura navegando por nossas categorias.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link key={category.id} href={`/categoria/${category.slug}`}>
                    <a className="elegant-card p-6 text-center hover:shadow-lg transition-all">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 gradient-overlay">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para Descobrir Peças Únicas?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Explore nossa coleção completa e encontre o artesanato perfeito para você.
              </p>
              <Button size="lg" asChild>
                <Link href="/produtos">
                  <a className="flex items-center gap-2">
                    Começar a Comprar
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
