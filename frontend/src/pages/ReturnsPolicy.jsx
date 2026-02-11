import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';

const ReturnsPolicy = () => {
    return (
        <div className="min-h-screen bg-[var(--branco-off-white)]">
            <SEO
                title="Trocas e Devoluções"
                description="Política de trocas e devoluções do Ateliê Filhos de Aruanda."
            />

            {/* Header */}
            <header className="bg-[var(--azul-profundo)] text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/" className="text-[var(--dourado-suave)] hover:underline text-sm mb-4 inline-block">
                        ← Voltar para Home
                    </Link>
                    <h1 className="font-playfair text-4xl md:text-5xl mb-4">Trocas e Devoluções</h1>
                    <p className="font-lato text-lg text-white/70">
                        Sua satisfação é nossa prioridade
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Notice Banner */}
                <div className="bg-[var(--dourado-suave)]/10 border-l-4 border-[var(--dourado-suave)] p-6 mb-12 rounded-r">
                    <div className="flex items-start gap-4">
                        <ExternalLink className="text-[var(--dourado-suave)] shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-playfair text-xl text-[var(--azul-profundo)] mb-2">
                                Vendas pela TikTok Shop
                            </h3>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70 mb-3">
                                Todas as solicitações de troca e devolução devem ser feitas através da{" "}
                                <a
                                    href="https://www.tiktok.com/@atelie_filhos_de_aruanda"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--dourado-suave)] hover:underline font-semibold"
                                >
                                    TikTok Shop
                                </a>
                                , seguindo as políticas da plataforma.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Returns Info */}
                <div className="space-y-8">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <RotateCcw className="text-[var(--dourado-suave)]" size={28} />
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">
                                Prazo para Devolução
                            </h2>
                        </div>
                        <p className="font-lato text-[var(--azul-profundo)]/70 leading-relaxed mb-4">
                            Você tem até <strong>7 dias corridos</strong> após o recebimento do produto para solicitar
                            a devolução ou troca, conforme o Código de Defesa do Consumidor.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="text-[var(--dourado-suave)]" size={28} />
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">
                                Condições para Troca/Devolução
                            </h2>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                ✓ Produto sem uso e em perfeito estado
                            </p>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                ✓ Embalagem original preservada
                            </p>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                ✓ Todos os acessórios e manuais incluídos
                            </p>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                ✓ Nota fiscal ou comprovante de compra
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-[var(--dourado-suave)]" size={28} />
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">
                                Produtos Não Aceitos para Devolução
                            </h2>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-6 rounded-lg space-y-3">
                            <p className="font-lato text-sm text-red-900">
                                ✗ Produtos personalizados ou feitos sob encomenda
                            </p>
                            <p className="font-lato text-sm text-red-900">
                                ✗ Produtos com sinais de uso ou danificados
                            </p>
                            <p className="font-lato text-sm text-red-900">
                                ✗ Produtos sem embalagem original
                            </p>
                            <p className="font-lato text-sm text-red-900">
                                ✗ Velas já acesas ou com embalagem violada
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-playfair text-2xl text-[var(--azul-profundo)] mb-4">
                            Como Solicitar
                        </h2>
                        <ol className="space-y-4 font-lato text-[var(--azul-profundo)]/70">
                            <li className="flex gap-3">
                                <span className="font-semibold text-[var(--dourado-suave)]">1.</span>
                                <span>Acesse sua compra na TikTok Shop</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-[var(--dourado-suave)]">2.</span>
                                <span>Clique em "Solicitar devolução" ou "Solicitar troca"</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-[var(--dourado-suave)]">3.</span>
                                <span>Informe o motivo e anexe fotos, se necessário</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-semibold text-[var(--dourado-suave)]">4.</span>
                                <span>Aguarde a aprovação e instruções para envio</span>
                            </li>
                        </ol>
                    </section>

                    <section className="bg-[var(--azul-profundo)]/5 p-6 rounded-lg">
                        <h2 className="font-playfair text-xl text-[var(--azul-profundo)] mb-3">
                            Reembolso
                        </h2>
                        <p className="font-lato text-sm text-[var(--azul-profundo)]/70 leading-relaxed">
                            Após a aprovação da devolução e recebimento do produto em nossas instalações,
                            o reembolso será processado em até 7 dias úteis através da mesma forma de pagamento utilizada na compra.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReturnsPolicy;
