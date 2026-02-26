import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { productService } from "../services/productService";
import { Search, Loader2, Wind } from "lucide-react";
import { Product } from "../types";

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // Chamada direta à API com parâmetro de busca para ativar Stemming (velas -> vela)
                const items = await productService.getProducts({ search: query });
                setResults(items);
            } catch (error) {
                console.error("Erro na busca:", error);
            } finally {
                setLoading(false);
            }
        };
        performSearch();
    }, [query]);

    return (
        <div className="min-h-screen bg-[var(--branco-off-white)] pt-12 pb-24">
            <SEO
                title={query ? `Busca: ${query}` : "Nossa Coleção"}
                description={`Resultados de busca para ${query || 'artigos religiosos'} no Ateliê Filhos de Aruanda.`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Cabeçalho de Busca */}
                <div className="border-b border-[var(--azul-profundo)]/10 pb-10 mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-[1px] bg-[var(--dourado-suave)]"></div>
                                <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[var(--dourado-suave)]">
                                    Busca de Axé
                                </span>
                            </div>
                            <h1 className="font-playfair text-4xl md:text-5xl text-[var(--azul-profundo)]">
                                {query ? (
                                    <>
                                        Resultados para <span className="italic">"{query}"</span>
                                    </>
                                ) : (
                                    "Nossa Coleção"
                                )}
                            </h1>
                        </div>
                        {!loading && (
                            <p className="font-lato text-[11px] text-[#0f2A44]/50 uppercase tracking-[0.2em] bg-white px-4 py-2 border border-[#0f2A44]/5">
                                {results.length}{" "}
                                {results.length === 1 ? "item encontrado" : "itens encontrados"}
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    /* Estado de Carregamento (Skeleton Animado) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="space-y-5 animate-pulse">
                                <div className="aspect-[4/5] bg-[#0f2A44]/5"></div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-[#0f2A44]/5 w-1/3 mx-auto"></div>
                                    <div className="h-4 bg-[#0f2A44]/5 w-full"></div>
                                    <div className="h-4 bg-[#0f2A44]/10 w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    /* Grade de Resultados usando o componente oficial ProductCard */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {results.map((product) => (
                            <div key={product.id} className="animate-fade-in">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Estado Vazio - Estilo Zen */
                    <div className="text-center py-32 flex flex-col items-center border border-[#0f2A44]/5 bg-white/50">
                        <div className="relative mb-8">
                            <Search size={64} className="text-[#0f2A44]/5" strokeWidth={1} />
                            <Wind
                                size={32}
                                className="text-[#C9A24D]/30 absolute -bottom-2 -right-2 animate-bounce"
                            />
                        </div>
                        <h2 className="font-playfair text-3xl text-[#0f2A44] mb-4">
                            Ainda não encontramos...
                        </h2>
                        <p className="font-lato text-sm text-[#0f2A44]/60 max-w-sm mx-auto mb-10 leading-relaxed">
                            Não encontramos resultados para sua busca. Que tal tentar termos
                            mais suaves ou explorar nossas coleções principais?
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/store?categoria=velas"
                                className="border border-[#0f2A44] text-[#0f2A44] px-8 py-3 font-lato text-[10px] uppercase tracking-[0.2em] hover:bg-[#0f2A44] hover:text-white transition-all"
                            >
                                Velas
                            </Link>
                            <Link
                                to="/store?categoria=guias"
                                className="border border-[#0f2A44] text-[#0f2A44] px-8 py-3 font-lato text-[10px] uppercase tracking-[0.2em] hover:bg-[#0f2A44] hover:text-white transition-all"
                            >
                                Guias
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
