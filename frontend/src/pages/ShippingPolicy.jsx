import React from 'react';
import { Link } from 'react-router-dom';
import { Package, TruckIcon, Clock, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';

const ShippingPolicy = () => {
    return (
        <div className="min-h-screen bg-[var(--branco-off-white)]">
            <SEO
                title="Políticas de Envio"
                description="Conheça nossas políticas de envio e prazos de entrega."
            />

            {/* Header */}
            <header className="bg-[var(--azul-profundo)] text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/" className="text-[var(--dourado-suave)] hover:underline text-sm mb-4 inline-block">
                        ← Voltar para Home
                    </Link>
                    <h1 className="font-playfair text-4xl md:text-5xl mb-4">Políticas de Envio</h1>
                    <p className="font-lato text-lg text-white/70">
                        Informações sobre prazos e formas de entrega
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
                                Atualmente, todas as nossas vendas são realizadas exclusivamente através da{" "}
                                <a
                                    href="https://www.tiktok.com/@atelie_filhos_de_aruanda"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--dourado-suave)] hover:underline font-semibold"
                                >
                                    TikTok Shop
                                </a>
                                . As políticas de envio seguem as diretrizes da plataforma.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-8">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="text-[var(--dourado-suave)]" size={28} />
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">
                                Processamento do Pedido
                            </h2>
                        </div>
                        <p className="font-lato text-[var(--azul-profundo)]/70 leading-relaxed">
                            Todos os pedidos são processados em até 2 dias úteis após a confirmação do pagamento.
                            Você receberá um código de rastreamento assim que o pedido for despachado.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <TruckIcon className="text-[var(--dourado-suave)]" size={28} />
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">
                                Métodos de Envio
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="font-lato font-semibold text-[var(--azul-profundo)] mb-2">
                                    Correios (PAC)
                                </h3>
                                <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                    Prazo de entrega: 8 a 15 dias úteis (dependendo da região)
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="font-lato font-semibold text-[var(--azul-profundo)] mb-2">
                                    Correios (SEDEX)
                                </h3>
                                <p className="font-lato text-sm text-[var(--azul-profundo)]/70">
                                    Prazo de entrega: 3 a 7 dias úteis (dependendo da região)
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="text-[var(--dourado-suave)]" size={28} />
                            <h2 className="font-playfair text-2xl text-[var(--azul-profundo)]">
                                Rastreamento
                            </h2>
                        </div>
                        <p className="font-lato text-[var(--azul-profundo)]/70 leading-relaxed">
                            Após o envio, você receberá um código de rastreamento por e-mail ou através da plataforma TikTok Shop.
                            Você poderá acompanhar seu pedido em tempo real através do site dos Correios.
                        </p>
                    </section>

                    <section className="bg-[var(--azul-profundo)]/5 p-6 rounded-lg">
                        <h2 className="font-playfair text-xl text-[var(--azul-profundo)] mb-3">
                            Importante
                        </h2>
                        <ul className="space-y-2 font-lato text-sm text-[var(--azul-profundo)]/70">
                            <li>• Os prazos de entrega começam a contar após o despacho do pedido</li>
                            <li>• Não nos responsabilizamos por atrasos causados pelos Correios</li>
                            <li>• Certifique-se de fornecer um endereço completo e correto</li>
                            <li>• Para mais informações, entre em contato através da TikTok Shop</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
