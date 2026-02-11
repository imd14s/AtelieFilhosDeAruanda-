import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone, Heart, ShoppingBag, Video } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--azul-profundo)] text-[var(--branco-off-white)] pt-16 pb-8 border-t border-[var(--dourado-suave)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          {/* Coluna 1: Branding & Missão */}
          <div className="space-y-6">
            <h2 className="font-playfair text-2xl leading-tight">
              Ateliê <br />
              <span className="text-[var(--dourado-suave)] text-sm font-lato uppercase tracking-[0.2em]">Filhos de Aruanda</span>
            </h2>
            <p className="font-lato text-sm text-[var(--branco-off-white)]/70 leading-relaxed">
              Espiritualidade com axé, cuidado e propósito. Produtos artesanais feitos com fé e consciência para iluminar o seu caminhar.
            </p>
          </div>

          {/* Coluna 2: Suporte */}
          <div>
            <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Suporte</h3>
            <ul className="space-y-3 font-lato text-sm text-[var(--branco-off-white)]/70">
              <li><Link to="/ethics" className="hover:text-[var(--dourado-suave)] transition-colors">Ética & Valores</Link></li>
              <li><Link to="/about" className="hover:text-[var(--dourado-suave)] transition-colors">Nossa História</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-[var(--dourado-suave)] transition-colors">Políticas de Envio</Link></li>
              <li><Link to="/returns-policy" className="hover:text-[var(--dourado-suave)] transition-colors">Trocas e Devoluções</Link></li>
              <li><Link to="/faq" className="hover:text-[var(--dourado-suave)] transition-colors">Perguntas Frequentes</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div className="space-y-6">
            <div>
              <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Contato</h3>
              <ul className="space-y-4 font-lato text-sm text-[var(--branco-off-white)]/70">
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-[var(--dourado-suave)] shrink-0" />
                  <div className="flex flex-col">
                    <span>(11) 96321-2172</span>
                    <span>(11) 95348-2232</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-[var(--dourado-suave)] shrink-0" />
                  <span>mundodearuanda@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="font-lato text-xs uppercase tracking-widest text-[var(--dourado-suave)] mb-3">Redes Sociais</h4>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/atelie_filhosdearuanda/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group"
                  title="Instagram"
                >
                  <Instagram size={18} className="group-hover:text-[var(--azul-profundo)]" />
                </a>
                <a
                  href="https://tiktok.com/@atelie_filhos_de_aruanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group"
                  title="TikTok"
                >
                  <Video size={18} className="group-hover:text-[var(--azul-profundo)]" />
                </a>
                <a
                  href="https://www.youtube.com/@MundodeAruanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group"
                  title="YouTube"
                >
                  <svg className="w-5 h-5 group-hover:text-[var(--azul-profundo)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.mercadolivre.com.br/pagina/umbandaaxe777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group"
                  title="Mercado Livre"
                >
                  <ShoppingBag size={18} className="group-hover:text-[var(--azul-profundo)]" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé Inferior */}
        <div className="border-t border-[var(--branco-off-white)]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-lato text-[10px] text-[var(--branco-off-white)]/30 uppercase tracking-[0.2em] text-center md:text-left">
            © {currentYear} Ateliê Filhos de Aruanda. CNPJ: 36.720.385/0001-09
          </p>

          <div className="flex items-center gap-1 font-lato text-[10px] text-[var(--branco-off-white)]/30 uppercase tracking-widest">
            Feito com <Heart size={12} className="text-[var(--dourado-suave)] fill-[var(--dourado-suave)] animate-pulse" /> para iluminar caminhos.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;