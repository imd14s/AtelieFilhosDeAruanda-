import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardHome } from './pages/dashboard/Home';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductForm } from './pages/products/ProductForm'; // Import do Form
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
        <Route path="/products/new" element={<ProductForm />} /> {/* Rota de Criação */}
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
