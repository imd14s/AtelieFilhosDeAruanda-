import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Package, Zap, Users, Shield, Truck, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { StoreSelector } from './StoreSelector';

export function DashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Resumo', path: '/' },
    { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
    { icon: Package, label: 'Produtos', path: '/products' },
    { icon: Zap, label: 'Automações & IA', path: '/automations' },
    { icon: Zap, label: 'Automações & IA', path: '/automations' },
    { icon: Settings, label: 'Configurações', path: '/configs' },
    { icon: Users, label: 'Equipe', path: '/settings/team' },
    { icon: Shield, label: 'Auditoria', path: '/settings/audit' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">


        <div className="p-4 border-b">
          <StoreSelector />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
