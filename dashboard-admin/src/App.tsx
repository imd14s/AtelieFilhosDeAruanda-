import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Carregando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<h2 className="text-2xl font-bold">Resumo do Sistema (Em breve)</h2>} />
            <Route path="orders" element={<h2>Pedidos</h2>} />
            <Route path="products" element={<h2>Gestão de Produtos</h2>} />
            <Route path="automations" element={<h2>Automações & IA</h2>} />
            <Route path="configs" element={<h2>Configurações do Sistema</h2>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
