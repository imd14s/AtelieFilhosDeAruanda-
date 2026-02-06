import React from 'react';
import { Sparkles, Heart, Handshake, Sun } from 'lucide-react';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <div className="bg-[var(--branco-off-white)] min-h-screen">

      <SEO
        title="Nossa Essência"
        description="Conheça a história e os valores do Ateliê Filhos de Aruanda. Um trabalho de fé, amor e axé."
      />
      {/* HERO DA PÁGINA */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/wallpaper.jpg"
            alt="Fundo espiritual"
            className="w-full h-full object-cover opacity-30 grayscale-[50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F4]/0 to-[#F7F7F4]"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <span className="font-lato text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--dourado-suave)] block mb-4">Desde 2023</span>
          <h1 className="font-playfair text-5xl md:text-7xl text-[var(--branco-off-white)] leading-tight mb-6">Nossa Essência</h1>
          <div className="flex items-center gap-4 text-[var(--branco-off-white)]/60 justify-center">
            <div className="h-[1px] w-12 bg-[var(--dourado-suave)]"></div>
            <Sparkles size={18} className="text-[var(--dourado-suave)]" />
            <div className="h-[1px] w-12 bg-[var(--dourado-suave)]"></div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 1: O ENCONTRO */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="font-playfair text-4xl text-[var(--azul-profundo)]">Trabalho de Fé e Amor</h2>
            <div className="space-y-6 font-lato text-base text-[var(--azul-profundo)]/70 leading-relaxed">
              <p>
                O Ateliê Filhos de Aruanda nasceu do desejo de unir a arte manual com a espiritualidade.
                Acreditamos que cada objeto carrega uma energia única, e por isso, cada guia, cada vela e
                cada banho é preparado com absoluto respeito às tradições.
              </p>
              <p>
                Nossa missão é fornecer ferramentas para que você possa vivenciar sua fé com beleza, dignidade e
                propósito, mantendo viva a chama da nossa ancestralidade.
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-1/2">
            <div className="aspect-[3/4] overflow-hidden shadow-2xl">
              <img
                src="/images/art.jpg"
                alt="Processo artesanal"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Detalhe Decorativo */}
            <div className="absolute -bottom-6 -left-6 bg-[#0f2A44] text-[#F7F7F4] p-8 hidden md:block">
              <Sparkles size={24} className="text-[#C9A24D] mb-2" />
              <p className="font-playfair text-lg italic">"Cada guia é uma oração."</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: VALORES (CARDS) */}
      <section className="bg-white py-24 border-y border-[#0f2A44]/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                <Heart size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair text-xl text-[#0f2A44]">Com Respeito</h3>
              <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                Respeito absoluto às tradições e aos fundamentos, apoiando sua caminhada com verdade.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                <Sun size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair text-xl text-[#0f2A44]">Com Consciência</h3>
              <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                Artigos que conectam corpo, mente e espírito, prezando pela ética e simplicidade.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F4] flex items-center justify-center text-[#C9A24D]">
                <Handshake size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-playfair text-xl text-[#0f2A44]">Com Acolhimento</h3>
              <p className="font-lato text-sm text-[#0f2A44]/60 leading-relaxed">
                Aqui, cada cliente é recebido como parte fundamental da nossa corrente de fé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: O MANIFESTO */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <h2 className="font-playfair text-3xl md:text-4xl text-[#0f2A44]">Nosso Compromisso</h2>
          <div className="bg-[#0f2A44] p-12 md:p-20 text-[#F7F7F4] relative">
            {/* Aspas Decorativas */}
            <span className="absolute top-8 left-8 text-6xl font-serif text-[#C9A24D] opacity-30">"</span>

            <p className="font-lato text-lg md:text-xl leading-relaxed italic relative z-10">
              Que este espaço seja um ponto de encontro com a paz, a proteção e o amor de Aruanda.
            </p>

            <span className="absolute bottom-4 right-8 text-6xl font-serif text-[#C9A24D] opacity-30">"</span>
          </div>
          <p className="font-lato text-sm text-[#0f2A44]/50 uppercase tracking-[0.3em]">
            Ateliê Filhos de Aruanda
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;