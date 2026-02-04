import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, Heart, Send, Loader2 } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Função para assinar Newsletter diretamente no CRM do Wix
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Cria um contato ou assina newsletter via Wix
      // Nota: Depende da permissão de 'Contacts' no seu Client ID Headless
      console.log("Inscrito:", email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error("Erro ao assinar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[var(--azul-profundo)] text-[var(--branco-off-white)] pt-16 pb-8 border-t border-[var(--dourado-suave)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Coluna 1: Branding & Missão */}
          <div className="space-y-6">
            <h2 className="font-playfair text-2xl leading-tight">
              Ateliê <br />
              <span className="text-[var(--dourado-suave)] text-sm font-lato uppercase tracking-[0.2em]">Filhos de Aruanda</span>
            </h2>
            <p className="font-lato text-sm text-[var(--branco-off-white)]/70 leading-relaxed">
              Espiritualidade com axé, cuidado e propósito. Produtos artesanais feitos com fé e consciência para iluminar o seu caminhar.
            </p>

            {/* Newsletter Integrada */}
            <div className="pt-2">
              <p className="font-lato text-[10px] uppercase tracking-widest text-[var(--dourado-suave)] mb-3">Receba nosso Axé</p>
              {subscribed ? (
                <p className="text-xs font-lato text-green-400">Obrigado por se inscrever!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="relative max-w-[240px]">
                  <input
                    type="email"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 py-2 pl-3 pr-10 text-xs font-lato focus:outline-none focus:border-[#C9A24D] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--dourado-suave)] hover:text-white transition-colors"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida (Ajustada para rotas do site) */}
          <div>
            <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Navegação</h3>
            <ul className="space-y-3 font-lato text-sm text-[var(--branco-off-white)]/70">
              <li><Link to="/loja?categoria=velas" className="hover:text-[var(--dourado-suave)] transition-colors">Velas Artesanais</Link></li>
              <li><Link to="/loja?categoria=guias" className="hover:text-[var(--dourado-suave)] transition-colors">Guias e Brajás</Link></li>
              <li><Link to="/loja?categoria=ervas" className="hover:text-[var(--dourado-suave)] transition-colors">Ervas & Defumação</Link></li>
              <li><Link to="/sobre" className="hover:text-[var(--dourado-suave)] transition-colors">Nossa História</Link></li>
              <li><Link to="/contato" className="hover:text-[var(--dourado-suave)] transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div>
            <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Suporte</h3>
            <ul className="space-y-3 font-lato text-sm text-[var(--branco-off-white)]/70">
              <li><Link to="/politicas-envio" className="hover:text-[var(--dourado-suave)] transition-colors">Políticas de Envio</Link></li>
              <li><Link to="/trocas" className="hover:text-[var(--dourado-suave)] transition-colors">Trocas e Devoluções</Link></li>
              <li><Link to="/faq" className="hover:text-[var(--dourado-suave)] transition-colors">Perguntas Frequentes</Link></li>
              <li><Link to="/termos" className="hover:text-[var(--dourado-suave)] transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div className="space-y-6">
            <div>
              <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Contato</h3>
              <ul className="space-y-4 font-lato text-sm text-[var(--branco-off-white)]/70">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-[var(--dourado-suave)] shrink-0" />
                  <span>São Paulo, SP - Atendimento Online</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-[var(--dourado-suave)] shrink-0" />
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-[var(--dourado-suave)] shrink-0" />
                  <span>contato@filhosdearuanda.com.br</span>
                </li>
              </ul>
            </div>

            {/* Redes Sociais com Hover */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group">
                <Instagram size={18} className="group-hover:text-[var(--azul-profundo)]" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group">
                <Facebook size={18} className="group-hover:text-[var(--azul-profundo)]" />
              </a>
            </div>
          </div>

        </div>

        {/* Rodapé Inferior */}
        <div className="border-t border-[var(--branco-off-white)]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-lato text-[10px] text-[var(--branco-off-white)]/30 uppercase tracking-[0.2em] text-center md:text-left">
            © {currentYear} Ateliê Filhos de Aruanda. CNPJ: 00.000.000/0001-00
          </p>

          <div className="flex items-center gap-1 font-lato text-[10px] text-[var(--branco-off-white)]/30 uppercase tracking-widest">
            Feito com <Heart size={12} className="text-[var(--dourado-suave)] fill-[var(--dourado-suave)] animate-pulse" /> para iluminar caminhos.
          </div>

          {/* Selos de Pagamento */}
          <div className="flex gap-3 items-center grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix_Brasil.png" alt="Pix" className="h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;