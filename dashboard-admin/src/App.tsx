import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardHome } from './pages/dashboard/Home';
import { DashboardLayout } from './components/layout/DashboardLayout'; // Importando o Layout

// Componente de proteção que envolve o Layout
const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  
  // Se logado, mostra o Layout (Sidebar) e o conteúdo filho (Outlet)
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rotas Protegidas com Layout */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardHome />} />
        {/* Futuras rotas virão aqui: /products, /orders, etc */}
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}