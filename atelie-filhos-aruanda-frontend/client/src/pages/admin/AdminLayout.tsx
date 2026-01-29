import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
