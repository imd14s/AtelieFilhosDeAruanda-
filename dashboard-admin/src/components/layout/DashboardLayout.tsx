import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Package, Zap, Users, Shield, Truck, CreditCard, Ticket, Mail, ChevronDown, ChevronRight, Plus, Tag, Plug } from 'lucide-react';
import clsx from 'clsx';


interface NavItem {
  icon: any;
  label: string;
  path?: string;
  children?: NavItem[];
}

export function DashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Produtos': true,
    'Configurações': true,
    'Marketing': true
  });

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Resumo', path: '/' },
    { icon: ShoppingBag, label: 'Pedidos', path: '/orders' },
    {
      icon: Package,
      label: 'Produtos',
      children: [
        { icon: Package, label: 'Listagem', path: '/products' },
        { icon: Plus, label: 'Novo Produto', path: '/products/new' },
        { icon: Tag, label: 'Categorias', path: '/categories' }
      ]
    },
    { icon: Zap, label: 'Automações & IA', path: '/automations' },
    {
      icon: Ticket,
      label: 'Marketing',
      children: [
        { icon: Ticket, label: 'Cupons', path: '/marketing/coupons' },
        { icon: Mail, label: 'Recuperação', path: '/marketing/abandoned-cart' },
      ]
    },
    {
      icon: Settings,
      label: 'Configurações',
      children: [
        { icon: Settings, label: 'Gerais', path: '/configs' },
        { icon: Plug, label: 'Integrações', path: '/settings/integrations' },
        { icon: Users, label: 'Equipe', path: '/settings/team' },
        { icon: Shield, label: 'Auditoria', path: '/settings/audit' },
        { icon: Truck, label: 'Frete', path: '/settings/shipping' },
        { icon: CreditCard, label: 'Pagamentos', path: '/settings/payment' },
      ]
    },
  ];

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;

    if (item.children) {
      const isExpanded = expanded[item.label];
      // Check if any child is active to highlight parent
      const isChildActive = item.children.some(child => child.path && location.pathname.startsWith(child.path));

      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={clsx(
              "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              isChildActive ? "text-indigo-700 bg-indigo-50/50" : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-100 pl-2 space-y-1 mt-1">
              {item.children.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isActive = item.path === location.pathname;
    return (
      <Link
        key={item.path}
        to={item.path!}
        className={clsx(
          "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-700 hover:bg-gray-50"
        )}
      >
        <Icon className="w-5 h-5 mr-3" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col flex-shrink-0">


        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => renderNavItem(item))}
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
