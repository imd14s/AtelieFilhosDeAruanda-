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
    window.addEventListener('cart-updated', initHeader);
    return () => window.removeEventListener('cart-updated', initHeader);
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
      </div>


      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header >
  );
};

export default Header;
