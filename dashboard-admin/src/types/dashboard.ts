export interface DashboardSummary {
    totalSales: number;
    pendingOrders: number;
    lowStockAlerts: number;
}

// ESTA É A PARTE QUE ESTAVA FALTANDO:
export interface AutomationStatus {
    enabled: boolean;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    active: boolean;
    category?: {
        name: string;
    };
}
