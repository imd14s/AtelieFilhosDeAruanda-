import React from 'react';
import { Leaf, Heart, Users, Shield, Sparkles, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

const EthicsPage = () => {
    return (
        <div className="bg-[var(--branco-off-white)] min-h-screen">

            <SEO
                title="Ética e Valores"
                description="Conheça os princípios éticos e valores que guiam o Ateliê Filhos de Aruanda. Sustentabilidade, respeito às tradições e comércio justo."
            />

            {/* HERO DA PÁGINA */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/orixas.jpg"
                        alt="Símbolos espirituais"
                        className="w-full h-full object-cover opacity-20 grayscale-[30%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F4]/0 to-[#F7F7F4]"></div>
                </div>

                <div className="relative z-10 text-center px-4">
                    <span className="font-lato text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--dourado-suave)] block mb-4">
                        Nossos Princípios
                    </span>
                    <h1 className="font-playfair text-5xl md:text-7xl text-[var(--azul-profundo)] leading-tight mb-6">
                        Ética & Valores
                    </h1>
                    <div className="flex items-center gap-4 text-[var(--azul-profundo)]/60 justify-center">
                        <div className="h-[1px] w-12 bg-[var(--dourado-suave)]"></div>
                        <Sparkles size={18} className="text-[var(--dourado-suave)]" />
                        <div className="h-[1px] w-12 bg-[var(--dourado-suave)]"></div>
                    </div>
                </div>
            </section>

            {/* INTRODUÇÃO */}
            <section className="max-w-4xl mx-auto px-4 py-20 text-center">
                <p className="font-lato text-lg md:text-xl text-[var(--azul-profundo)]/70 leading-relaxed">
                    No Ateliê Filhos de Aruanda, acreditamos que cada produto carrega não apenas energia espiritual,
                    mas também a responsabilidade de honrar a terra, as tradições e as pessoas que fazem parte desta corrente.
                    Nossos valores são a base de tudo o que criamos.
                </p>
            </section>

            {/* PILARES ÉTICOS - GRID */}
            <section className="bg-white py-24 border-y border-[#0f2A44]/5">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-16 text-center">
                        Nossos Pilares Éticos
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

                        {/* Pilar 1: Sustentabilidade */}
                        <div className="flex flex-col items-center text-center space-y-4 p-6 hover:bg-[#F7F7F4] transition-colors rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#3EDF4B]">
                                <Leaf size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#0f2A44]">Sustentabilidade</h3>
                            <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                                Utilizamos materiais naturais e biodegradáveis sempre que possível. Nossas embalagens são
                                recicláveis e priorizamos fornecedores locais para reduzir nossa pegada de carbono.
                            </p>
                        </div>

                        {/* Pilar 2: Respeito às Tradições */}
                        <div className="flex flex-col items-center text-center space-y-4 p-6 hover:bg-[#F7F7F4] transition-colors rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                                <Sparkles size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#0f2A44]">Respeito às Tradições</h3>
                            <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                                Cada produto é criado com respeito aos fundamentos das religiões de matriz africana.
                                Estudamos, consultamos e honramos os conhecimentos ancestrais em cada etapa.
                            </p>
                        </div>

                        {/* Pilar 3: Comércio Justo */}
                        <div className="flex flex-col items-center text-center space-y-4 p-6 hover:bg-[#F7F7F4] transition-colors rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                                <Users size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#0f2A44]">Comércio Justo</h3>
                            <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                                Trabalhamos diretamente com artesãos locais, garantindo remuneração justa e condições
                                dignas de trabalho. Valorizamos o trabalho manual e a economia solidária.
                            </p>
                        </div>

                        {/* Pilar 4: Transparência */}
                        <div className="flex flex-col items-center text-center space-y-4 p-6 hover:bg-[#F7F7F4] transition-colors rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                                <Shield size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#0f2A44]">Transparência</h3>
                            <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                                Somos transparentes sobre a origem dos nossos materiais, processos de produção e
                                precificação. Você tem o direito de saber exatamente o que está adquirindo.
                            </p>
                        </div>

                        {/* Pilar 5: Qualidade Artesanal */}
                        <div className="flex flex-col items-center text-center space-y-4 p-6 hover:bg-[#F7F7F4] transition-colors rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                                <Heart size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#0f2A44]">Qualidade Artesanal</h3>
                            <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                                Cada peça é única, feita à mão com dedicação e cuidado. Não produzimos em massa -
                                cada item recebe atenção individual e energia positiva.
                            </p>
                        </div>

                        {/* Pilar 6: Inclusão */}
                        <div className="flex flex-col items-center text-center space-y-4 p-6 hover:bg-[#F7F7F4] transition-colors rounded-sm">
                            <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                                <Users size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[#0f2A44]">Inclusão e Diversidade</h3>
                            <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                                Acolhemos todas as pessoas, independente de raça, gênero, orientação sexual ou religião.
                                Nossa espiritualidade é de amor, respeito e acolhimento.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* COMPROMISSOS PRÁTICOS */}
            <section className="max-w-5xl mx-auto px-4 py-24">
                <h2 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-12 text-center">
                    Nossos Compromissos na Prática
                </h2>

                <div className="space-y-6">
                    <div className="flex gap-4 items-start bg-white p-6 rounded-sm shadow-sm">
                        <CheckCircle size={24} className="text-[#3EDF4B] flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-lato font-bold text-[#0f2A44] mb-2">Ingredientes Naturais</h4>
                            <p className="font-lato text-sm text-[#0f2A44]/70 leading-relaxed">
                                Todas as nossas velas são feitas com cera de abelha ou soja, sem parafina derivada de petróleo.
                                Nossas ervas são orgânicas e colhidas de forma sustentável.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-white p-6 rounded-sm shadow-sm">
                        <CheckCircle size={24} className="text-[#3EDF4B] flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-lato font-bold text-[#0f2A44] mb-2">Embalagens Conscientes</h4>
                            <p className="font-lato text-sm text-[#0f2A44]/70 leading-relaxed">
                                Utilizamos papel kraft reciclado, tecidos reutilizáveis e evitamos plásticos descartáveis.
                                Incentivamos nossos clientes a reutilizar ou reciclar as embalagens.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-white p-6 rounded-sm shadow-sm">
                        <CheckCircle size={24} className="text-[#3EDF4B] flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-lato font-bold text-[#0f2A44] mb-2">Apoio à Comunidade</h4>
                            <p className="font-lato text-sm text-[#0f2A44]/70 leading-relaxed">
                                Parte dos nossos lucros é destinada a projetos sociais que apoiam comunidades de terreiro,
                                preservação cultural e educação sobre religiões de matriz africana.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-white p-6 rounded-sm shadow-sm">
                        <CheckCircle size={24} className="text-[#3EDF4B] flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-lato font-bold text-[#0f2A44] mb-2">Educação e Conscientização</h4>
                            <p className="font-lato text-sm text-[#0f2A44]/70 leading-relaxed">
                                Promovemos workshops e conteúdos educativos sobre o uso correto dos produtos,
                                combate à intolerância religiosa e valorização da cultura afro-brasileira.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start bg-white p-6 rounded-sm shadow-sm">
                        <CheckCircle size={24} className="text-[#3EDF4B] flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-lato font-bold text-[#0f2A44] mb-2">Produção Consciente</h4>
                            <p className="font-lato text-sm text-[#0f2A44]/70 leading-relaxed">
                                Não mantemos grandes estoques. Produzimos sob demanda sempre que possível,
                                evitando desperdícios e garantindo que cada produto seja fresco e energizado.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION FINAL */}
            <section className="bg-[var(--azul-profundo)] text-[var(--branco-off-white)] py-20">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
                    <Sparkles size={40} className="text-[var(--dourado-suave)] mx-auto" />
                    <h2 className="font-playfair text-3xl md:text-4xl">
                        Caminhe Conosco com Consciência
                    </h2>
                    <p className="font-lato text-base md:text-lg leading-relaxed opacity-90">
                        Ao escolher o Ateliê Filhos de Aruanda, você não está apenas adquirindo um produto -
                        você está apoiando uma cadeia de valores éticos, sustentáveis e espiritualmente conscientes.
                        Juntos, construímos um mundo mais justo, respeitoso e iluminado.
                    </p>
                    <div className="pt-4">
                        <a
                            href="/store"
                            className="inline-block bg-[var(--dourado-suave)] text-[var(--azul-profundo)] px-10 py-4 font-lato text-[11px] uppercase tracking-[0.2em] hover:bg-[var(--branco-off-white)] transition-all duration-500 shadow-xl"
                        >
                            Conheça Nossa Coleção
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default EthicsPage;
