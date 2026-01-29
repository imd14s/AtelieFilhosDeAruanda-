import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, DollarSign, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Pedidos",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Receita Total",
      value: `R$ ${stats?.totalRevenue || "0.00"}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Pedidos Pendentes",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Total de Produtos",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu e-commerce
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Painel Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use o menu lateral para gerenciar produtos, pedidos, categorias e configurações do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
