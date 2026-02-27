/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { Loader2, ChevronLeft, Sparkles, Wind } from "lucide-react";
import { productService } from '../services/productService';
import { Product, Category } from "../types";

import OptimizedImage from "../components/ui/OptimizedImage";

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [collection, setCollection] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const categories = await productService.getCategories();
                const currentCollection = categories.find(
                    (c) => c.slug === slug || c.id === slug || c.name.toLowerCase() === slug.toLowerCase(),
                );

                if (currentCollection) {
                    setCollection(currentCollection);
                    const allProducts = await productService.getProducts({ category: currentCollection.id });
                    setProducts(allProducts);
                } else {
                    setCollection(null);
                }
            } catch (error) {
                console.error("Erro ao carregar categoria:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[var(--branco-off-white)] gap-4">
                <Loader2 className="animate-spin text-[var(--dourado-suave)]" size={32} />
                <span className="font-lato text-[10px] uppercase tracking-[0.3em] text-[var(--azul-profundo)]">
                    Sintonizando energias...
                </span>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--branco-off-white)] p-4 text-center">
                <h2 className="font-playfair text-2xl text-[var(--azul-profundo)] mb-4">
                    Categoria não encontrada
                </h2>
                <Link
                    to="/loja"
                    className="text-[var(--dourado-suave)] font-lato text-xs uppercase tracking-widest border-b border-[var(--dourado-suave)]"
                >
                    Voltar para a Loja
                </Link>
            </div>
        );
    }

    const headerImageUrl = collection.imageUrl || collection.media?.mainMedia?.image?.url;

    const categoryJsonLd = React.useMemo(() => {
        if (!collection) return undefined;
        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": window.location.origin
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": collection.name,
                    "item": window.location.href
                }
            ]
        };
        return JSON.stringify(schema);
    }, [collection]);

    return (
        <div className="bg-[var(--branco-off-white)] min-h-screen">
            <SEO
                title={`Artigos para ${collection.name} | Melhores Preços`}
                description={collection.description || `Confira nossa seleção exclusiva de artigos para ${collection.name}. Velas, Guias, Ervas e tudo o que você precisa com a qualidade do Ateliê.`}
                image={collection.imageUrl || collection.media?.mainMedia?.image?.url}
                keywords={`${collection.name}, artigos de umbanda, ateliê aruanda, ${collection.name} comprar`}
                jsonLd={categoryJsonLd}
            />

            {/* HEADER DINÂMICO DA CATEGORIA */}
            <header className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-[var(--azul-profundo)]">
                {headerImageUrl ? (
                    <OptimizedImage
                        src={headerImageUrl}
                        alt={collection.name}
                        width={1920}
                        height={600}
                        priority={true}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f2A44] to-[#1a4163]"></div>
                )}

                <div className="relative z-10 text-center px-4 space-y-4">
                    <Link
                        to="/loja"
                        className="inline-flex items-center gap-2 text-[var(--dourado-suave)] hover:text-[var(--branco-off-white)] transition-colors mb-4"
                    >
                        <ChevronLeft size={16} />
                        <span className="font-lato text-[10px] uppercase tracking-widest">
                            Todos os Produtos
                        </span>
                    </Link>
                    <h1 className="font-playfair text-5xl md:text-7xl text-[var(--branco-off-white)] capitalize italic">
                        {collection.name}
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-[var(--dourado-suave)]/50"></div>
                        <Sparkles size={16} className="text-[var(--dourado-suave)]" />
                        <div className="h-[1px] w-12 bg-[var(--dourado-suave)]/50"></div>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO */}
            <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                {/* DESCRIÇÃO DA CATEGORIA */}
                {collection.description && (
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <p className="font-lato text-base md:text-lg text-[var(--azul-profundo)]/70 leading-relaxed italic">
                            "{collection.description}"
                        </p>
                    </div>
                )}

                {/* GRID DE PRODUTOS */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {products.map((product) => (
                            <div key={product.id} className="animate-fade-in">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 border border-dashed border-[var(--azul-profundo)]/10 rounded-lg">
                        <Wind className="mx-auto text-[var(--azul-profundo)]/20 mb-4" size={40} />
                        <p className="font-lato text-[11px] uppercase tracking-widest text-[var(--azul-profundo)]/40">
                            Nenhum item disponível nesta categoria no momento.
                        </p>
                    </div>
                )}
            </section>

            {/* FOOTER DE NAVEGAÇÃO RÁPIDA */}
            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="border-t border-[var(--azul-profundo)]/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h4 className="font-playfair text-[var(--azul-profundo)]/40 text-lg uppercase tracking-widest">
                        Explorar Outras Vertentes
                    </h4>
                    <div className="flex gap-8">
                        <Link
                            to="/categoria/velas"
                            className="font-lato text-[10px] uppercase tracking-[0.2em] text-[var(--azul-profundo)] hover:text-[var(--dourado-suave)] transition-colors"
                        >
                            Velas
                        </Link>
                        <Link
                            to="/categoria/guias"
                            className="font-lato text-[10px] uppercase tracking-[0.2em] text-[var(--azul-profundo)] hover:text-[var(--dourado-suave)] transition-colors"
                        >
                            Guias
                        </Link>
                        <Link
                            to="/categoria/ervas"
                            className="font-lato text-[10px] uppercase tracking-[0.2em] text-[var(--azul-profundo)] hover:text-[var(--dourado-suave)] transition-colors"
                        >
                            Ervas
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
