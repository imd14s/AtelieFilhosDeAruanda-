import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardHome } from './pages/dashboard/Home';
import { ProductsPage } from './pages/products/ProductsPage';
import { OrdersPage } from './pages/orders/OrdersList';
import { ConfigPage } from './pages/configs/ConfigPage';
import { TeamPage } from './pages/settings/TeamPage';
import { AuditLogPage } from './pages/settings/AuditLogPage';
import { ShippingPage } from './pages/settings/ShippingPage';
import { PaymentPage } from './pages/settings/PaymentPage';
import { ProductForm } from './pages/products/ProductForm';
import { DashboardLayout } from './components/layout/DashboardLayout';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/configs" element={<ConfigPage />} />
        <Route path="/settings/team" element={<TeamPage />} />
        <Route path="/settings/audit" element={<AuditLogPage />} />
        <Route path="/settings/shipping" element={<ShippingPage />} />
        <Route path="/settings/payment" element={<PaymentPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <TenantProvider>
          <AppRoutes />
        </TenantProvider>
      </AuthProvider>
    </Router>
  );
}
