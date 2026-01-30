export interface DashboardSummary {
    totalSales: number;
    pendingOrders: number;
    lowStockAlerts: number;
}

export interface AutomationStatus {
    enabled: boolean;
}

export interface ProductVariant {
  id?: string;
  name: string;      // Ex: "Tamanho G"
  sku: string;       // Ex: "CAM-AZUL-G"
  price: number;
  stock: number;
  image?: string;    // URL da imagem específica desta variação
  attributes?: string; // Ex: "Cor: Azul, Material: Algodão"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  active: boolean;
  images: string[];
  variants: ProductVariant[];
  category?: {
      name: string;
  };
}
