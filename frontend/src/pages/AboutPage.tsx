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
                        src="https://images.unsplash.com/photo-1605141162547-dec9eec1e075?q=80&w=2070&auto=format&fit=crop"
                        alt="Artesanato"
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

            {/* Manifesto */}
            <section className="py-24 px-4 bg-white border-b border-[#0f2A44]/5">
                <div className="max-w-4xl mx-auto text-center">
                    <Sparkles className="text-[#C9A24D] mx-auto mb-8" size={32} />
                    <h2 className="font-playfair text-4xl text-[#0f2A44] mb-12">Mais que uma loja, um elo de fé.</h2>
                    <div className="space-y-8 font-lato text-gray-600 leading-loose text-lg text-left md:text-center">
                        <p>
                            O Ateliê Filhos de Aruanda nasceu no coração do Axé, da necessidade de encontrar artigos religiosos que unissem o respeito às tradições com um acabamento impecável e artesanal.
                        </p>
                        <p>
                            Não acreditamos em produção em massa. Acreditamos que cada guia, cada vela e cada peça de decoração carrega uma energia única. Por isso, nossas mãos são nosso principal instrumento, e a devoção é nossa matéria-prima.
                        </p>
                        <p>
                            Cada detalhe é pensado para que, ao receber o seu produto, você sinta a vibração e o carinho com que ele foi confeccionado. É o nosso axé chegando até a sua casa.
                        </p>
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
                    src="https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9b?q=80&w=2070&auto=format&fit=crop"
                    alt="Footer Background"
                    className="w-full h-full object-cover"
                />
            </section>
        </div>
    );
};

export default AboutPage;
