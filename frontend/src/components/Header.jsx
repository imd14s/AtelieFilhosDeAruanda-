import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
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

  const initHeader = async () => {
    const user = authService.getUser();
    setUser(user);
    const cartItems = await cartService.get();
    setCart({ items: cartItems || [] });
  };

  useEffect(() => {
    initHeader();
    const handleOpenAuth = () => setIsAuthOpen(true);

    window.addEventListener('cart-updated', initHeader);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    window.addEventListener('auth-changed', initHeader); // Re-sincroniza ao logar/deslogar

    return () => {
      window.removeEventListener('cart-updated', initHeader);
      window.removeEventListener('open-auth-modal', handleOpenAuth);
      window.removeEventListener('auth-changed', initHeader);
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
    authService.logout();
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
                <div className="relative group border-r pr-5 border-[var(--azul-profundo)]/10 flex items-center h-full">
                  <div className="flex items-center gap-3 cursor-pointer py-4">
                    <div className="text-right">
                      <p className="font-lato text-[9px] uppercase tracking-widest text-[var(--dourado-suave)] group-hover:text-[var(--azul-profundo)] transition-colors">Axé</p>
                      <p className="font-playfair text-xs font-bold leading-none group-hover:text-[#C9A24D] transition-colors line-clamp-1 max-w-[100px] flex items-center gap-1">
                        {user.name || 'Membro'} <ChevronDown size={14} className="opacity-50" />
                      </p>
                    </div>
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-[var(--dourado-suave)] shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--azul-profundo)] text-[var(--dourado-suave)] flex items-center justify-center font-playfair font-bold text-sm shadow-sm border border-[var(--dourado-suave)]">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                    )}
                  </div>

                  {/* Dropdown Menu Meli Style */}
                  <div className="absolute top-full right-5 mt-[-8px] w-72 bg-white rounded-md shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xl">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800 text-base">{user.name}</p>
                        <Link to="/perfil" className="text-sm text-blue-500 hover:text-blue-600 flex items-center">
                          Meu perfil <ChevronRight size={14} className="ml-1" />
                        </Link>
                      </div>
                    </div>

                    <Link to="/perfil/compras" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Compras</Link>
                    <Link to="/perfil/historico" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Histórico</Link>
                    <Link to="/perfil/perguntas" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Perguntas</Link>
                    <Link to="/perfil/opinioes" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Opiniões</Link>
                    <Link to="/perfil/favoritos" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">Favoritos</Link>

                    <Link to="/perfil/assinaturas" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">Assinaturas</Link>

                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-b-md">Sair</button>
                  </div>
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
