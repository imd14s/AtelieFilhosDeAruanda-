import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative w-full h-[80vh] md:h-[85vh] overflow-hidden bg-[#F7F7F4]">
      {/* Camada de Textura Orgânica */}
      <div className="absolute inset-0 z-10 opacity-[0.04] pointer-events-none mix-blend-multiply" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        
        {/* Lado Esquerdo: Conteúdo */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-20 z-20 py-12 md:py-0">
          <div className="max-w-lg space-y-6 text-center md:text-left">
            <div className="space-y-3">
              <span className="font-lato text-[10px] md:text-xs uppercase tracking-[0.5em] text-[#C9A24D] block animate-fade-in">
                Artesania & Espiritualidade
              </span>
              <h1 className="font-playfair text-4xl md:text-6xl text-[#0f2A44] leading-[1.1] animate-slide-up">
                Energia que ilumina <br /> 
                <span className="italic font-normal">o seu caminhar.</span>
              </h1>
            </div>
            
            <p className="font-lato text-sm md:text-base text-[#0f2A44]/70 leading-relaxed max-w-md mx-auto md:mx-0 animate-fade-in-delayed">
              Descubra nossa coleção de velas artesanais, guias consagradas e ervas selecionadas, 
              criadas com o respeito e o axé do Ateliê Filhos de Aruanda.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 animate-fade-in-delayed">
              <Link 
                to="/store" 
                className="w-full sm:w-auto bg-[#0f2A44] text-[#F7F7F4] px-10 py-4 font-lato text-[11px] uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all duration-500 shadow-xl flex items-center justify-center gap-2 group"
              >
                Ver Coleção
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="w-full sm:w-auto border border-[#0f2A44]/20 text-[#0f2A44] px-10 py-4 font-lato text-[11px] uppercase tracking-[0.2em] hover:bg-[#0f2A44] hover:text-[#F7F7F4] transition-all duration-500 text-center"
              >
                Nossa História
              </Link>
            </div>
          </div>
        </div>

        {/* Lado Direito: Imagem Otimizada */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden">
          {/* Overlay gradiente para mobile (melhora leitura sobre a imagem se necessário) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F7F7F4] via-transparent to-transparent md:hidden z-10 h-20"></div>
          
          <img 
            src="/images/fe.jpeg" 
            alt="Velas artesanais e ervas" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          
          {/* Detalhe Decorativo */}
          <div className="absolute bottom-10 left-[-60px] w-48 h-48 border border-[#C9A24D]/15 rounded-full z-0 hidden md:block"></div>
        </div>
      </div>

      {/* Indicador de Rolagem */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 opacity-30">
        <span className="font-lato text-[8px] uppercase tracking-[0.3em] text-[#0f2A44]">Explorar Loja</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#0f2A44] to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;