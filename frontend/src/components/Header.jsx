import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { storeService } from '../services/storeService'; // Nova importação
import CartDrawer from './CartDrawer';
import SearchBar from './SearchBar';
import NavMenu from './NavMenu';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const initHeader = () => {
    setUser(storeService.auth.getUser());
    setCart(storeService.cart.get());
  };

  useEffect(() => {
    initHeader();
    const handleOpenAuth = () => setIsAuthOpen(true);
    window.addEventListener('cart-updated', initHeader);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => {
      window.removeEventListener('cart-updated', initHeader);
      window.removeEventListener('open-auth-modal', handleOpenAuth);
    };
  }, [location.pathname]);

  const cartQuantity = cart?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMenuOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    storeService.auth.logout();
  };

  useEffect(() => {
    document.body.style.overflow = (isCartOpen || isMenuOpen || isAuthOpen) ? 'hidden' : 'unset';
  }, [isCartOpen, isMenuOpen, isAuthOpen]);

  return (
    <header className="w-full bg-[var(--branco-off-white)] border-b border-[var(--azul-profundo)]/10 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6 gap-4">

          <button className="md:hidden text-[var(--azul-profundo)] p-2 -ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="text-center md:text-left md:w-1/3 group">
            <h1 className="font-playfair text-xl md:text-2xl text-[var(--azul-profundo)] leading-tight">
              Ateliê
              <span className="block text-[10px] md:text-sm font-lato tracking-[0.2em] uppercase text-[var(--dourado-suave)] group-hover:tracking-[0.3em] transition-all duration-300">
                Filhos de Aruanda
              </span>
            </h1>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md justify-center">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              isMobile={false}
            />
          </div>

          <div className="flex items-center justify-end gap-2 md:gap-6 md:w-1/3">
            <div className="hidden md:flex items-center gap-5 text-[var(--azul-profundo)]">
              {user ? (
                <div className="flex items-center gap-3 border-r pr-5 border-[var(--azul-profundo)]/10">
                  <div className="text-right">
                    <p className="font-lato text-[9px] uppercase tracking-widest text-[var(--dourado-suave)]">Axé</p>
                    <p className="font-playfair text-xs font-bold leading-none">{user.name || 'Membro'}</p>
                  </div>
                  <button onClick={handleLogout} className="text-[var(--azul-profundo)]/40 hover:text-red-800 transition-colors">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 hover:text-[var(--dourado-suave)] transition-all">
                  <User size={19} strokeWidth={1.5} />
                  <span className="text-[10px] uppercase font-lato tracking-[0.2em]">Entrar</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 text-[var(--azul-profundo)] hover:text-[var(--dourado-suave)] transition-all p-2 -mr-2 md:mr-0"
            >
              <div className="relative">
                <ShoppingCart size={22} strokeWidth={1.5} />
                {cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--dourado-suave)] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartQuantity}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-[10px] uppercase font-lato tracking-[0.2em]">Carrinho</span>
            </button>
          </div>
        </div>

        <div className="md:hidden pb-4 px-1">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} isMobile={true} />
        </div>
      </div>

      <div className="hidden md:block border-t border-[#0f2A44]/5">
        <NavMenu isMobile={false} />
      </div>

      <div className={`md:hidden fixed inset-0 z-40 bg-[var(--branco-off-white)] pt-24 px-6 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavMenu isMobile={true} closeMenu={() => setIsMenuOpen(false)} />

        <div className="mt-8 pt-8 border-t border-[var(--azul-profundo)]/10">
          {!user ? (
            <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} className="w-full py-3 bg-white border border-[var(--azul-profundo)]/10 rounded flex items-center justify-center gap-2 text-[var(--azul-profundo)]">
              <User size={18} />
              <span className="text-xs uppercase tracking-widest">Entrar / Cadastrar</span>
            </button>
          ) : (
            <button onClick={handleLogout} className="w-full py-3 bg-red-50 text-red-800 rounded flex items-center justify-center gap-2">
              <LogOut size={18} />
              <span className="text-xs uppercase tracking-widest">Sair</span>
            </button>
          )}
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart?.items || []} onUpdateCart={setCart} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};

export default Header;
