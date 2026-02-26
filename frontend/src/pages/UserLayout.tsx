import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, Tag, Star, User as UserIcon, ChevronDown, MessageCircle, CreditCard, LucideIcon } from 'lucide-react';
import SEO from '../components/SEO';
import { User } from '../types';

interface NavItem {
    label: string;
    icon: LucideIcon;
    path: string;
    exact?: boolean;
    hasSub?: boolean;
}

const UserLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const refreshUser = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    console.error("Erro ao parsear usuário do localStorage", e);
                    setUser(null);
                    navigate('/', { replace: true });
                }
            } else {
                setUser(null);
                navigate('/', { replace: true });
            }
        };

        refreshUser();
        window.addEventListener('auth-changed', refreshUser);
        return () => window.removeEventListener('auth-changed', refreshUser);
    }, [navigate]);

    if (!user) return null;

    const navItems: NavItem[] = [
        { label: 'Meu perfil', icon: UserIcon, path: '/perfil', exact: true },
        { label: 'Compras', icon: ShoppingBag, path: '/perfil/compras' },
        { label: 'Cupons e Benefícios', icon: Tag, path: '/perfil/beneficios' },
        { label: 'Opiniões', icon: MessageCircle, path: '/perfil/opinioes' },
        { label: 'Assinaturas', icon: Star, path: '/perfil/assinaturas' },
        { label: 'Cartões', icon: CreditCard, path: '/perfil/cartoes' },
    ];

    return (
        <div className="min-h-screen bg-[#ebebeb] font-lato">
            <SEO title="Minha Conta" description="Gerencie suas configurações e compras." />

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Menu className="md:hidden" size={20} />
                        Minha conta
                    </h2>

                    <nav className="space-y-1">
                        {navItems.map((item, idx) => {
                            const isActive = item.exact
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path) && item.path !== '#' && item.path !== '/';

                            const Icon = item.icon;

                            return (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-sm
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500'
                                            : 'text-gray-600 hover:bg-white hover:text-gray-900 border-l-4 border-transparent hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                                        {item.label}
                                    </div>
                                    {item.hasSub && <ChevronDown size={14} className={isActive ? 'text-blue-500' : 'text-gray-400'} />}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
