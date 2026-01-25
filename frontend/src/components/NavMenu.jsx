import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Velas', path: '/store?categoria=velas' },
  { name: 'Guias', path: '/store?categoria=guias' },
  { name: 'Ervas & Incensos', path: '/store?categoria=ervas' },
  { name: 'Nossa História', path: '/about' },
  { name: 'Axé & Ética', path: '/ethics' }
];

const NavMenu = ({ isMobile, closeMenu }) => {
  const location = useLocation();

  // Função para verificar se o link está ativo
  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname + location.search === path || location.pathname === path;
  };

  if (isMobile) {
    return (
      <ul className="flex flex-col items-center gap-8 py-4 bg-[#F7F7F4]">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link 
              to={item.path} 
              className={`font-lato text-[12px] uppercase tracking-[0.2em] transition-colors ${
                isActive(item.path) ? 'text-[#C9A24D] font-bold' : 'text-[#0f2A44]/80'
              }`} 
              onClick={closeMenu}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <nav className="hidden md:block border-t border-[#0f2A44]/5 bg-[#F7F7F4]/80 backdrop-blur-sm">
      <ul className="flex justify-center gap-12 py-4">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link 
              to={item.path} 
              className={`font-lato text-[10px] uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                isActive(item.path) ? 'text-[#C9A24D]' : 'text-[#0f2A44]/70 hover:text-[#C9A24D]'
              }`}
            >
              {item.name}
              {/* Linha de Hover/Ativo */}
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-[#C9A24D] transition-all duration-300 ${
                isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavMenu;