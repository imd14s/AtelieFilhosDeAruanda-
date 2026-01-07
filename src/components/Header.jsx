import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { checkMemberStatus, wixClient } from '../utils/wixClient';
import CartDrawer from './CartDrawer';
import SearchBar from './SearchBar';
import NavMenu from './NavMenu';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Inicialização de dados (Membro e Carrinho)
  const initHeader = async () => {
    try {
      // Busca Membro (com fallback seguro)
      if (wixClient.auth.loggedIn()) {
        const member = await checkMemberStatus();
        setUser(member);
      }

      // Busca Carrinho (Trata erro 404 de carrinho vazio do Wix)
      if (wixClient.currentCart) {
        const currentCart = await wixClient.currentCart.getCurrentCart();
        setCart(currentCart);
      }
    } catch (error) {
      // Se der erro 404 ou não logado, apenas mantemos os estados limpos
      console.log("Header: Carrinho vazio ou usuário deslogado.");
    }
  };

  useEffect(() => {
    initHeader();
  }, [location.pathname]); // Re-verifica ao mudar de página

  // 2. Cálculo da quantidade (Soma das quantidades de cada item)
  const cartQuantity = cart?.lineItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    try {
      await wixClient.auth.logout(window.location.origin);
      localStorage.removeItem('wix_tokens');
      setUser(null);
      setCart(null);
      navigate('/');
      window.location.reload(); 
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Bloqueia scroll quando drawers estão abertos
  useEffect(() => {
    document.body.style.overflow = (isCartOpen || isMenuOpen || isAuthOpen) ? 'hidden' : 'unset';
  }, [isCartOpen, isMenuOpen, isAuthOpen]);

  return (
    <header className="w-full bg-[#F7F7F4] border-b border-[#0f2A44]/10 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6 gap-4">
          
          {/* LOGO - Estilo Ateliê */}
          <Link to="/" className="text-left order-1 md:w-1/3 group">
            <h1 className="font-playfair text-xl md:text-2xl text-[#0f2A44] leading-tight">
              Ateliê 
              <span className="block text-[10px] md:text-sm font-lato tracking-[0.2em] uppercase text-[#C9A24D] group-hover:tracking-[0.3em] transition-all duration-300">
                Filhos de Aruanda
              </span>
            </h1>
          </Link>

          {/* BUSCA DESKTOP CENTRALIZADA */}
          <div className="hidden md:flex flex-1 max-w-md order-2">
            <SearchBar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onSearch={handleSearch} 
              isMobile={false} 
            />
          </div>

          {/* AÇÕES (User & Cart) */}
          <div className="flex items-center justify-end gap-4 md:gap-6 order-3 md:w-1/3">
            <div className="hidden md:flex items-center gap-5 text-[#0f2A44]">
              
              {user ? (
                <div className="flex items-center gap-3 border-r pr-5 border-[#0f2A44]/10">
                  <div className="text-right">
                    <p className="font-lato text-[9px] uppercase tracking-widest text-[#C9A24D]">Axé, Irmão(ã)</p>
                    <p className="font-playfair text-xs font-bold leading-none">
                      {user.contact?.firstName || 'Membro'}
                    </p>
                  </div>
                  <button onClick={handleLogout} className="text-[#0f2A44]/40 hover:text-red-800 transition-colors" title="Sair">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)} 
                  className="flex items-center gap-2 hover:text-[#C9A24D] transition-all group"
                >
                  <User size={19} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase font-lato tracking-[0.2em]">Entrar</span>
                </button>
              )}

              {/* CARRINHO */}
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative flex items-center gap-2 hover:text-[#C9A24D] transition-all group"
              >
                <div className="relative">
                  <ShoppingCart size={19} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
                  {cartQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#C9A24D] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in zoom-in duration-300">
                      {cartQuantity}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase font-lato tracking-[0.2em]">Carrinho</span>
              </button>
            </div>

            {/* Menu Mobile Button */}
            <button className="md:hidden text-[#0f2A44]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* BUSCA MOBILE (Abaixo da logo no celular) */}
        <div className="md:hidden pb-4 px-2">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} isMobile={true} />
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO (Categorias) */}
      <div className="hidden md:block border-t border-[#0f2A44]/5">
        <NavMenu isMobile={false} />
      </div>

      {/* DRAWER MENU MOBILE */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-[#F7F7F4] ${isMenuOpen ? 'max-h-[100vh] border-t border-[#0f2A44]/10' : 'max-h-0'}`}>
        <div className="py-6 px-4">
          <NavMenu isMobile={true} closeMenu={() => setIsMenuOpen(false)} />
          
          <div className="grid grid-cols-2 gap-4 pt-10 mt-6 border-t border-[#0f2A44]/5">
             {!user ? (
               <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} className="flex flex-col items-center gap-2 py-4 bg-white rounded-sm">
                 <User size={22} className="text-[#C9A24D]" />
                 <span className="text-[9px] uppercase font-lato tracking-widest">Entrar / Cadastrar</span>
               </button>
             ) : (
               <button onClick={handleLogout} className="flex flex-col items-center gap-2 py-4 bg-white rounded-sm">
                 <LogOut size={22} className="text-red-800/40" />
                 <span className="text-[9px] uppercase font-lato tracking-widest text-red-800/60">Sair da Conta</span>
               </button>
             )}
             
             <button onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }} className="flex flex-col items-center gap-2 py-4 bg-[#0f2A44] text-white rounded-sm relative">
               <ShoppingCart size={22} />
               {cartQuantity > 0 && (
                 <span className="absolute top-3 right-8 bg-[#C9A24D] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                   {cartQuantity}
                 </span>
               )}
               <span className="text-[9px] uppercase font-lato tracking-widest">Ver Sacola</span>
             </button>
          </div>
        </div>
      </div>

      {/* COMPONENTES DE OVERLAY (FORA DO FLUXO) */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart?.lineItems || []} 
        onUpdateCart={(updatedCart) => setCart(updatedCart)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};

export default Header;