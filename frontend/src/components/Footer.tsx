/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Video, Youtube, ShoppingBag, Heart, Send, Loader2 } from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import marketingService from '../services/marketingService';
import { authService } from '../services/authService';
import { User } from '../types';
import { SafeAny } from "../types/safeAny";

const Footer: React.FC = () => {
    const { categories } = useCategories();
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState<boolean>(false);
    const [subscribed, setSubscribed] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const initUser = () => setUser(authService.getUser());
        initUser();
        window.addEventListener('auth-changed', initUser);
        return () => window.removeEventListener('auth-changed', initUser);
    }, []);

    const handleSubscribe = async (e: React.MouseEvent | React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            window.dispatchEvent(new CustomEvent('show-alert', {
                detail: "Você precisa estar logado para receber cupons exclusivos e novidades!"
            }));
            window.dispatchEvent(new Event('open-auth-modal'));
            return;
        }

        setLoading(true);
        try {
            const response = await marketingService.subscribeNewsletter();
            setMessage(response.message || "Bem-vindo(a) à nossa Newsletter!");
            setSubscribed(true);

            // Feedback visual adicional para premium feel
            window.dispatchEvent(new CustomEvent('show-alert', {
                detail: "Sucesso! Verifique seu e-mail para novidades."
            }));
        } catch (err: SafeAny) {
            console.error("Erro ao assinar:", err);
            window.dispatchEvent(new CustomEvent('show-alert', {
                detail: err.message || "Erro ao assinar newsletter"
            }));
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

                        {/* Newsletter Integrada - Versão Chamativa */}
                        <div className="pt-2 bg-[var(--azul-profundo)]/40 p-4 rounded-lg border border-[var(--dourado-suave)]/10">
                            <p className="font-playfair text-sm text-[var(--dourado-suave)] mb-1 italic">Quer ganhar descontos?</p>
                            <p className="font-lato text-[11px] uppercase tracking-widest text-[var(--branco-off-white)]/80 mb-4">Receba novidades & cupons!</p>

                            {subscribed ? (
                                <div className="flex items-center gap-2 text-green-400 font-lato text-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center">
                                        <Send size={12} />
                                    </div>
                                    {message}
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className="w-full group relative overflow-hidden bg-gradient-to-r from-[var(--dourado-suave)] to-[#b8860b] hover:from-[#b8860b] hover:to-[var(--dourado-suave)] text-[var(--azul-profundo)] py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        {loading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Mail size={16} className="group-hover:scale-110 transition-transform" />
                                        )}
                                        <span className="font-lato">Quero Novidades e Cupons</span>
                                    </div>
                                </button>
                            )}
                            {!user && !subscribed && (
                                <p className="text-[9px] font-lato text-[var(--branco-off-white)]/40 mt-2 text-center italic">* Exclusivo para membros logados</p>
                            )}
                        </div>
                    </div>

                    {/* Coluna 2: Navegação Rápida (Ajustada para rotas do site) */}
                    <div>
                        <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Navegação</h3>
                        <ul className="space-y-3 font-lato text-sm text-[var(--branco-off-white)]/70">
                            {categories.slice(0, 3).map((cat) => (
                                <li key={cat.id}>
                                    <Link to={`/categoria/${cat.slug || cat.id}`} className="hover:text-[var(--dourado-suave)] transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            <li><Link to="/about" className="hover:text-[var(--dourado-suave)] transition-colors">Nossa História</Link></li>
                            <li><Link to="/contato" className="hover:text-[var(--dourado-suave)] transition-colors">Fale Conosco</Link></li>
                        </ul>
                    </div>

                    {/* Coluna 3: Suporte */}
                    <div>
                        <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Suporte</h3>
                        <ul className="space-y-3 font-lato text-sm text-[var(--branco-off-white)]/70">
                            <li><Link to="/ethics" className="hover:text-[var(--dourado-suave)] transition-colors">Ética & Valores</Link></li>
                            <li><Link to="/politicas-de-envio" className="hover:text-[var(--dourado-suave)] transition-colors">Políticas de Envio</Link></li>
                            <li><Link to="/trocas-e-devolucoes" className="hover:text-[var(--dourado-suave)] transition-colors">Trocas e Devoluções</Link></li>
                            <li><Link to="/faq" className="hover:text-[var(--dourado-suave)] transition-colors">Perguntas Frequentes</Link></li>
                            <li><Link to="/termos" className="hover:text-[var(--dourado-suave)] transition-colors">Termos de Uso</Link></li>
                        </ul>
                    </div>

                    {/* Coluna 4: Contato */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-playfair text-lg mb-6 border-b border-[var(--dourado-suave)]/30 pb-2 inline-block">Contato</h3>
                            <ul className="space-y-4 font-lato text-sm text-[var(--branco-off-white)]/70">
                                <li className="flex items-center gap-4">
                                    <Phone size={18} className="text-[var(--dourado-suave)] shrink-0 mt-0.5" />
                                    <div className="flex flex-col space-y-1">
                                        <span>(11) 96321-2172</span>
                                        <span>(11) 95348-2232</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4">
                                    <Mail size={18} className="text-[var(--dourado-suave)] shrink-0" />
                                    <span>mundodearuanda@gmail.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Redes Sociais com Hover */}
                        <div>
                            <p className="font-lato text-[10px] uppercase tracking-widest text-[var(--dourado-suave)] mb-4">REDES SOCIAIS</p>
                            <div className="flex gap-4">
                                <a href="https://www.instagram.com/atelie_filhosdearuanda/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group">
                                    <Instagram size={18} className="group-hover:text-[var(--azul-profundo)]" />
                                </a>
                                <a href="https://www.tiktok.com/@atelie_filhos_de_aruanda" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group">
                                    <Video size={18} className="group-hover:text-[var(--azul-profundo)]" />
                                </a>
                                <a href="https://www.youtube.com/@MundodeAruanda" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group">
                                    <Youtube size={18} className="group-hover:text-[var(--azul-profundo)]" />
                                </a>
                                <a href="https://www.mercadolivre.com.br/pagina/umbandaaxe777" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[var(--dourado-suave)] hover:border-[var(--dourado-suave)] transition-all duration-300 group">
                                    <ShoppingBag size={18} className="group-hover:text-[var(--azul-profundo)]" />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Rodapé Inferior */}
                <div className="border-t border-[var(--branco-off-white)]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="font-lato text-[11px] text-[var(--branco-off-white)]/30 tracking-[0.1em] text-center md:text-left">
                        © {currentYear} ATELIÊ FILHOS DE ARUANDA. CNPJ: 36.720.385/0001-09
                    </p>

                    <div className="flex items-center gap-1 font-lato text-[10px] text-[var(--branco-off-white)]/30 uppercase tracking-widest">
                        Feito com <Heart size={12} className="text-[var(--dourado-suave)] fill-[var(--dourado-suave)] animate-pulse" /> para iluminar caminhos.
                    </div>

                    {/* Selos de Pagamento */}
                    <div className="flex gap-4 items-center grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        <img src="/images/visa.svg" alt="Visa" className="h-3" />
                        <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" />
                        <img src="/images/pix.svg" alt="Pix" className="h-4" />
                        <img src="/images/mercadopago.svg" alt="Mercado Pago" className="h-10" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
