 
 
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { productService } from '../services/productService';
import { Category } from '../types';

interface NavMenuProps {
    isMobile: boolean;
    closeMenu?: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ isMobile, closeMenu }) => {
    const location = useLocation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await productService.getCategories();
            // Filtra apenas ativas e ordena alfabeticamente
            setCategories(data.filter(c => c.active).sort((a, b) => a.name.localeCompare(b.name)));
        };
        fetchCategories();
    }, []);

    // Função para verificar se o link está ativo
    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname + location.search === path || location.pathname === path;
    };

    const isCategoryActive = categories.some(c => isActive(`/store?categoryId=${c.id}`));

    const mainLinks = [
        { name: 'Home', path: '/' },
        { name: 'Assinaturas', path: '/assinaturas' },
        { name: 'Nossa História', path: '/about' },
        { name: 'Axé & Ética', path: '/ethics' }
    ];

    if (isMobile) {
        return (
            <ul className="flex flex-col items-center gap-6 py-6 bg-[var(--branco-off-white)]">
                <li>
                    <Link
                        to="/"
                        className={`font-lato text-[12px] uppercase tracking-[0.2em] ${isActive('/') ? 'text-[var(--dourado-suave)] font-bold' : 'text-[var(--azul-profundo)]/80'}`}
                        onClick={closeMenu}
                    >
                        Home
                    </Link>
                </li>

                {/* Categoria Mobile Dropdown */}
                <li className="w-full flex flex-col items-center">
                    <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={`flex items-center gap-2 font-lato text-[12px] uppercase tracking-[0.2em] transition-colors ${isCategoryActive ? 'text-[var(--dourado-suave)] font-bold' : 'text-[var(--azul-profundo)]/80'}`}
                    >
                        Categorias {isCategoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isCategoryOpen && (
                        <ul className="mt-4 flex flex-col items-center gap-4 w-full bg-black/5 py-4">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        to={`/store?categoryId=${cat.id}`}
                                        className={`font-lato text-[11px] uppercase tracking-[0.1em] ${isActive(`/store?categoryId=${cat.id}`) ? 'text-[var(--dourado-suave)]' : 'text-[var(--azul-profundo)]/60'}`}
                                        onClick={closeMenu}
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>

                {mainLinks.slice(1).map((item) => (
                    <li key={item.name}>
                        <Link
                            to={item.path}
                            className={`font-lato text-[12px] uppercase tracking-[0.2em] transition-colors ${isActive(item.path) ? 'text-[var(--dourado-suave)] font-bold' : 'text-[var(--azul-profundo)]/80'}`}
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
        <nav className="hidden md:block border-t border-[var(--azul-profundo)]/5 bg-[var(--branco-off-white)]/80 backdrop-blur-sm relative z-50">
            <ul className="flex justify-center items-center gap-12 py-4">
                <li className="h-full flex items-center">
                    <Link
                        to="/"
                        className={`font-lato text-[10px] uppercase tracking-[0.2em] transition-all duration-300 relative group flex items-center h-6 ${isActive('/') ? 'text-[var(--dourado-suave)]' : 'text-[var(--azul-profundo)]/70 hover:text-[var(--dourado-suave)]'}`}
                    >
                        Home
                        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-[var(--dourado-suave)] transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                </li>

                {/* Categorias Desktop Dropdown */}
                <li
                    className="relative h-full flex items-center group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        className={`flex items-center gap-1 h-6 bg-transparent border-none p-0 focus:outline-none font-lato text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${isCategoryActive || isHovered ? 'text-[var(--dourado-suave)]' : 'text-[var(--azul-profundo)]/70 hover:text-[var(--dourado-suave)]'}`}
                    >
                        Categorias <ChevronDown size={12} className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />
                        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-[var(--dourado-suave)] transition-all duration-300 ${isCategoryActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>

                    {/* Submenu Desktop */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-56 transition-all duration-300 ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                        <div className="bg-white shadow-xl border border-gray-100 py-2">
                            {categories.length === 0 ? (
                                <div className="px-4 py-2 text-[10px] text-gray-400 uppercase tracking-widest text-center">Carregando...</div>
                            ) : (
                                categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/store?categoryId=${cat.id}`}
                                        className={`block px-6 py-3 text-[10px] uppercase tracking-[0.15em] transition-colors hover:bg-[var(--branco-off-white)] ${isActive(`/store?categoryId=${cat.id}`) ? 'text-[var(--dourado-suave)] bg-[var(--branco-off-white)]' : 'text-[var(--azul-profundo)]/70'}`}
                                    >
                                        {cat.name}
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </li>

                {mainLinks.slice(1).map((item) => (
                    <li key={item.name} className="h-full flex items-center">
                        <Link
                            to={item.path}
                            className={`font-lato text-[10px] uppercase tracking-[0.2em] transition-all duration-300 relative group flex items-center h-6 ${isActive(item.path) ? 'text-[var(--dourado-suave)]' : 'text-[var(--azul-profundo)]/70 hover:text-[var(--dourado-suave)]'}`}
                        >
                            {item.name}
                            <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-[var(--dourado-suave)] transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default NavMenu;
