import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as Icons from 'lucide-react';
import clsx from 'clsx';

const {
  LayoutDashboard, ShoppingBag, Settings, LogOut, Package,
  Zap, Users, Shield, Truck, CreditCard, Ticket, Mail,
  ChevronDown, ChevronRight, Plus, Tag, Plug, Repeat, Menu, X, Bell, PenTool, Send
} = Icons;

console.log('Icons loaded:', { Bell: !!Bell });


interface NavItem {
  icon: any;
  label: string;
  path?: string;
  children?: NavItem[];
}

export function DashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Produtos': true,
    'Configurações': true,
    'Marketing': true
  });

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const closeSidebar = () => setSidebarOpen(false);

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
        { icon: Mail, label: 'Campanhas', path: '/marketing/campaigns' },
        { icon: Users, label: 'Assinantes', path: '/marketing/subscribers' },
        { icon: Send, label: 'Fila de E-mails', path: '/marketing/email-queue' },
        { icon: Zap, label: 'Mensagens Automáticas', path: '/marketing/templates' },
        { icon: PenTool, label: 'Assinaturas', path: '/marketing/signatures' },
        { icon: Ticket, label: 'Cupons', path: '/marketing/coupons' },
        { icon: Mail, label: 'Recuperação', path: '/marketing/abandoned-cart' },
      ]
    },
    {
      icon: Repeat,
      label: 'Assinaturas',
      path: '/subscriptions'
    },
    {
      icon: Settings,
      label: 'Configurações',
      children: [
        { icon: Zap, label: 'IA', path: '/settings/ai' },
        { icon: Plug, label: 'Integrações', path: '/settings/integrations' },
        { icon: Send, label: 'E-mails (Remetente)', path: '/settings/email' },
        { icon: Users, label: 'Clientes', path: '/settings/users' },
        { icon: Users, label: 'Equipe', path: '/settings/team' },
        { icon: Shield, label: 'Auditoria', path: '/settings/audit' },
        { icon: Truck, label: 'Frete', path: '/settings/shipping' },
        { icon: CreditCard, label: 'Pagamentos', path: '/settings/payment' },
        { icon: Bell, label: 'Alerta de Estoque', path: '/settings/stock-alerts' },
      ]
    },
  ];

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;

    if (item.children) {
      const isExpanded = expanded[item.label];
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
        onClick={closeSidebar}
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

  const sidebarContent = (
    <>
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
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm flex items-center justify-between px-4 h-14 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          aria-label="Abrir menu"
        >
          <Menu size={24} />
        </button>
        <span className="font-semibold text-gray-800">Painel Admin</span>
        <div className="w-10" /> {/* Spacer para centralizar título */}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Desktop — sempre visível em md+ */}
      <aside className="hidden md:flex md:w-64 bg-white shadow-md flex-col flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-50 transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-gray-800">Menu</span>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 pt-18 md:p-8 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
