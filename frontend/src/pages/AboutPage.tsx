import React from 'react';
import { Sparkles, Heart, Shield, Users } from 'lucide-react';
import SEO from '../components/SEO';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-[#F7F7F4] min-h-screen">
            <SEO
                title="Nossa História | Ateliê Filhos de Aruanda"
                description="Conheça a história, a missão e os valores por trás do Ateliê Filhos de Aruanda. Artesanato com alma, fé e axé."
            />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#0f2A44]">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="/images/wallpaper.jpg"
                        alt="Artesanato Umbanda"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl">
                    <h1 className="font-playfair text-5xl md:text-7xl text-white mb-6">Nossa História</h1>
                    <div className="w-24 h-1 bg-[#C9A24D] mx-auto mb-8"></div>
                    <p className="font-lato text-lg text-[#F7F7F4]/90 uppercase tracking-[0.3em] leading-relaxed">
                        Artesanato com alma feito para quem tem fé.
                    </p>
                </div>
            </section>

            {/* História (Manifesto) */}
            <section className="py-24 px-4 bg-[#F7F7F4]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Text */}
                        <div>
                            <h2 className="font-playfair text-4xl text-[#0f2A44] mb-8">Trabalho de Fé e Amor</h2>
                            <div className="space-y-6 font-lato text-gray-600 leading-relaxed text-lg">
                                <p>
                                    Ateliê Filhos de Aruanda nasceu do encontro de duas almas gêmeas unidas pelo amor, pela fé e pelo respeito à espiritualidade. Mais do que uma loja, somos um espaço criado com propósito, axé e cuidado em cada detalhe.
                                </p>
                                <p>
                                    Acreditamos na Umbanda como caminho de luz, caridade e evolução espiritual. Por isso, cada produto é escolhido e preparado com carinho, respeito às tradições e intenção positiva, para apoiar sua caminhada espiritual com verdade e consciência.
                                </p>
                                <p>
                                    Nosso compromisso é oferecer artigos que conectem corpo, mente e espírito, sempre prezando pela ética, pela simplicidade e pelo acolhimento. Aqui, cada cliente é recebido como parte da nossa corrente de fé.
                                </p>
                                <p>
                                    Que este espaço seja um ponto de encontro com a paz, a proteção e o amor de Aruanda.
                                </p>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="relative mt-8 lg:mt-0 lg:ml-8">
                            <img
                                src="/images/art.jpg"
                                alt="Círculo de Guias Espirituais"
                                className="w-full h-auto object-cover shadow-xl max-h-[600px]"
                            />
                            {/* Decorative Box */}
                            <div className="absolute -bottom-6 -left-6 lg:-bottom-12 lg:-left-12 bg-[#0f2A44] p-8 shadow-2xl max-w-xs z-10 hidden sm:block">
                                <Sparkles className="text-[#C9A24D] mb-4" size={24} />
                                <p className="font-playfair italic text-white text-xl">"Cada guia é uma oração."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valores */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div className="text-center group p-8 hover:bg-white hover:shadow-xl transition-all duration-500 rounded-sm italic">
                            <div className="w-16 h-16 bg-[#0f2A44]/5 flex items-center justify-center rounded-full mx-auto mb-6 text-[#0f2A44] group-hover:bg-[#0f2A44] group-hover:text-white transition-colors">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-playfair text-xl text-[#0f2A44] mb-4">Feito com Amor</h3>
                            <p className="font-lato text-sm text-gray-500 leading-relaxed uppercase tracking-widest">Dedicamos tempo e alma em cada ponto de nossas peças.</p>
                        </div>

                        <div className="text-center group p-8 hover:bg-white hover:shadow-xl transition-all duration-500 rounded-sm italic">
                            <div className="w-16 h-16 bg-[#0f2A44]/5 flex items-center justify-center rounded-full mx-auto mb-6 text-[#0f2A44] group-hover:bg-[#0f2A44] group-hover:text-white transition-colors">
                                <Shield size={24} />
                            </div>
                            <h3 className="font-playfair text-xl text-[#0f2A44] mb-4">Qualidade Sagrada</h3>
                            <p className="font-lato text-sm text-gray-500 leading-relaxed uppercase tracking-widest">Materiais selecionados para garantir durabilidade e beleza.</p>
                        </div>

                        <div className="text-center group p-8 hover:bg-white hover:shadow-xl transition-all duration-500 rounded-sm italic">
                            <div className="w-16 h-16 bg-[#0f2A44]/5 flex items-center justify-center rounded-full mx-auto mb-6 text-[#0f2A44] group-hover:bg-[#0f2A44] group-hover:text-white transition-colors">
                                <Users size={24} />
                            </div>
                            <h3 className="font-playfair text-xl text-[#0f2A44] mb-4">Comunidade e Fé</h3>
                            <p className="font-lato text-sm text-gray-500 leading-relaxed uppercase tracking-widest">Um espaço de acolhimento e respeito a todas as vertentes.</p>
                        </div>

                        <div className="text-center group p-8 hover:bg-white hover:shadow-xl transition-all duration-500 rounded-sm italic">
                            <div className="w-16 h-16 bg-[#0f2A44]/5 flex items-center justify-center rounded-full mx-auto mb-6 text-[#0f2A44] group-hover:bg-[#0f2A44] group-hover:text-white transition-colors">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="font-playfair text-xl text-[#0f2A44] mb-4">Axé em Detalhes</h3>
                            <p className="font-lato text-sm text-gray-500 leading-relaxed uppercase tracking-widest">Pequenos toques que fazem toda a diferença na sua conexão.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Imagem de Rodapé */}
            <section className="h-96 w-full overflow-hidden">
                <img
                    src="/images/about/footer_ocean_sunset_1772830663230.png"
                    alt="Footer Background Ocean Sunset"
                    className="w-full h-full object-cover"
                />
            </section>
        </div>
    );
};

export default AboutPage;
