import React from 'react';
import { Sparkles, Heart, Sun, Users } from 'lucide-react';
import SEO from '../components/SEO';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-[var(--branco-off-white)] min-h-screen">
            <SEO
                title="Nossa Essência | Ateliê Filhos de Aruanda"
                description="Conheça a história e o propósito do Ateliê Filhos de Aruanda. Trabalho artesanal feito com alma, fé e axé."
            />

            {/* HERO SECTION - ESSÊNCIA */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 scale-110">
                    <img
                        src="/images/wallpaper.jpg"
                        alt="Background"
                        className="w-full h-full object-cover blur-sm opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--branco-off-white)]/40 to-[var(--branco-off-white)]"></div>
                </div>

                <div className="relative z-10 text-center px-4">
                    <span className="font-lato text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--dourado-suave)] block mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        Desde 2023
                    </span>
                    <h1 className="font-playfair text-5xl md:text-8xl text-[var(--azul-profundo)] leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Nossa Essência
                    </h1>
                    <div className="flex items-center gap-4 text-[var(--azul-profundo)] justify-center">
                        <div className="h-[1px] w-12 bg-[var(--dourado-suave)]"></div>
                        <Sparkles size={18} className="text-[var(--dourado-suave)]" />
                        <div className="h-[1px] w-12 bg-[var(--dourado-suave)]"></div>
                    </div>
                </div>
            </section>

            {/* SECTION: TRABALHO DE FÉ E AMOR */}
            <section className="max-w-7xl mx-auto px-4 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 pr-0 lg:pr-12">
                        <h2 className="font-playfair text-4xl text-[var(--azul-profundo)] leading-tight">
                            Trabalho de Fé e Amor
                        </h2>
                        <div className="space-y-6 font-lato text-[var(--azul-profundo)]/70 text-base leading-relaxed text-justify">
                            <p>
                                O Ateliê Filhos de Aruanda nasceu do desejo de unir a arte manual com a espiritualidade. Acreditamos que cada objeto carrega uma energia única, e por isso, cada guia, cada vela e cada banho é preparado com absoluto respeito às tradições.
                            </p>
                            <p>
                                Nossa missão é fornecer ferramentas para que você possa vivenciar sua fé com beleza, dignidade e propósito, mantendo viva a chama da nossa ancestralidade.
                            </p>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-[var(--dourado-suave)]/10 rounded-sm scale-95 group-hover:scale-100 transition-transform duration-700"></div>
                        <div className="relative overflow-hidden rounded-sm shadow-2xl">
                            <img
                                src="/images/orixas.jpg"
                                alt="Nossa Missão"
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>

                        {/* Floating Quote Box */}
                        <div className="absolute -bottom-10 -left-10 md:left-4 bg-[var(--azul-profundo)] p-8 shadow-2xl max-w-[280px]">
                            <Sparkles size={24} className="text-[var(--dourado-suave)] mb-4" />
                            <p className="font-playfair italic text-white text-lg leading-relaxed">
                                "Cada guia é uma oração."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALORES SECTION */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center space-y-6 p-8 group">
                            <div className="w-20 h-20 rounded-full bg-[var(--branco-off-white)] flex items-center justify-center text-[var(--dourado-suave)] group-hover:bg-[var(--azul-profundo)] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl">
                                <Heart size={32} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[var(--azul-profundo)]">Com Respeito</h3>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/60 leading-relaxed uppercase tracking-widest">
                                Respeito absoluto às tradições e aos fundamentos, apoiando sua caminhada com verdade.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-6 p-8 group">
                            <div className="w-20 h-20 rounded-full bg-[var(--branco-off-white)] flex items-center justify-center text-[var(--dourado-suave)] group-hover:bg-[var(--azul-profundo)] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl">
                                <Sun size={32} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[var(--azul-profundo)]">Com Consciência</h3>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/60 leading-relaxed uppercase tracking-widest">
                                Artigos que conectam corpo, mente e espírito, prezando pela ética e simplicidade.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-6 p-8 group">
                            <div className="w-20 h-20 rounded-full bg-[var(--branco-off-white)] flex items-center justify-center text-[var(--dourado-suave)] group-hover:bg-[var(--azul-profundo)] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl">
                                <Users size={32} />
                            </div>
                            <h3 className="font-playfair text-2xl text-[var(--azul-profundo)]">Com Acolhimento</h3>
                            <p className="font-lato text-sm text-[var(--azul-profundo)]/60 leading-relaxed uppercase tracking-widest">
                                Aqui, cada cliente é recebido como parte fundamental da nossa corrente de fé.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NOSSO COMPROMISSO */}
            <section className="py-40 max-w-5xl mx-auto px-4 text-center">
                <h2 className="font-playfair text-4xl text-[var(--azul-profundo)] mb-20 uppercase tracking-[0.2em]">
                    Nosso Compromisso
                </h2>
                <div className="bg-[var(--azul-profundo)] p-16 md:p-24 relative overflow-hidden shadow-2xl rounded-sm">
                    {/* Decoration background symbols */}
                    <div className="absolute top-0 right-0 opacity-5 -mr-10 -mt-10">
                        <Sparkles size={200} />
                    </div>

                    <p className="font-playfair text-2xl md:text-3xl text-[var(--branco-off-white)] italic leading-relaxed relative z-10 font-light">
                        "Que este espaço seja um ponto de encontro com a paz, a proteção e o amor de Aruanda."
                    </p>

                    <div className="mt-12 flex flex-col items-center gap-4 relative z-10">
                        <div className="h-[1px] w-24 bg-[var(--dourado-suave)]/40"></div>
                        <span className="font-lato text-[10px] uppercase tracking-[0.4em] text-[var(--dourado-suave)]">
                            Ateliê Filhos de Aruanda
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
