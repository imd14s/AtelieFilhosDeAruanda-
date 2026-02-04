import { ProductService } from './ProductService';

// Não precisamos mais chamar endpoints que não existem no Java.
// O serviço agora será um "Calculador" local baseado na lista de produtos.

export const DashboardService = {
  // Calcula o resumo baseado na lista de produtos que o Java entrega
  getSummaryFromProducts: async () => {
    try {
      // 1. Busca a lista real do Backend
      const products = await ProductService.getAll();
      
      // 2. Faz os cálculos no Frontend (Navegador)
      const totalProducts = products.length;
      
      // Conta produtos com estoque abaixo de 10
      const lowStockAlerts = products.filter(p => (p.stockQuantity || 0) < 10).length;

      // Como não temos endpoint de "Vendas" no backend ainda, mockamos ou zeramos
      const totalSales = 0; 
      const pendingOrders = 0;

      return {
        totalProducts,
        totalSales,
        pendingOrders,
        lowStockAlerts
      };
    } catch (error) {
      console.error("Erro ao calcular resumo:", error);
      return { totalProducts: 0, totalSales: 0, pendingOrders: 0, lowStockAlerts: 0 };
    }
  },

  // Mock para automação (já que o backend não tem esse controle ainda)
  getAutomationStatus: async () => {
    return { enabled: false }; // Desativado por padrão
  }
};
