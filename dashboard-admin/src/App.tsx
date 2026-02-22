import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SetupWizard } from './pages/setup/SetupWizard';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { ProductsPage } from './pages/products/ProductsPage';
import { OrdersPage } from './pages/orders/OrdersList';
import { AiConfigPage } from './pages/settings/AiConfigPage';
import { TeamPage } from './pages/settings/TeamPage';
import { AuditLogPage } from './pages/settings/AuditLogPage';
import { ShippingPage } from './pages/settings/ShippingPage';
import { PaymentPage } from './pages/settings/PaymentPage';
import { CouponList } from './pages/marketing/CouponList';
import { CampaignsPage } from './pages/marketing/CampaignsPage';
import { AbandonedCartPage } from './pages/marketing/AbandonedCartPage';
import { ProductForm } from './pages/products/ProductForm';
import { StockAlertPage } from './pages/settings/StockAlertPage';
import { AutomationsPage } from './pages/marketing/AutomationsPage';
import { IntegrationsPage } from './pages/settings/IntegrationsPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { SubscriptionPlansPage } from './pages/subscriptions/SubscriptionPlansPage';
import { SubscribersPage } from './pages/marketing/SubscribersPage';
import { SignaturesPage } from './pages/marketing/SignaturesPage';
import { UsersPage } from './pages/settings/UsersPage';
import { EmailSettingsPage } from './pages/settings/EmailSettingsPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

console.log('App initialization - Routes loaded');


const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetupWizard />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/settings/ai" element={<AiConfigPage />} />
        <Route path="/settings/team" element={<TeamPage />} />
        <Route path="/settings/audit" element={<AuditLogPage />} />
        <Route path="/settings/shipping" element={<ShippingPage />} />
        <Route path="/settings/payment" element={<PaymentPage />} />
        <Route path="/settings/email" element={<EmailSettingsPage />} />
        <Route path="/settings/stock-alerts" element={<StockAlertPage />} />
        <Route path="/marketing/coupons" element={<CouponList />} />
        <Route path="/marketing/campaigns" element={<CampaignsPage />} />
        <Route path="/marketing/subscribers" element={<SubscribersPage />} />
        <Route path="/marketing/signatures" element={<SignaturesPage />} />
        <Route path="/marketing/abandoned-cart" element={<AbandonedCartPage />} />
        <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/settings/users" element={<UsersPage />} />
        <Route path="/settings/integrations" element={<IntegrationsPage />} />
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
