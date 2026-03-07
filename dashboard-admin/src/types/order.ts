export interface Order {
  id: string;
  customerName: string;
  total: number;
  totalAmount: number;
  shippingCost: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  createdAt: string;
  labelUrlMe?: string;
  labelUrlCustom?: string;
  invoiceUrl?: string;
  trackingCode?: string;
  shippingIdExternal?: string;
  paymentMethod?: string;
  discount?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string;
  variantId?: string;
}

export interface CancelOrderDTO {
  reason: string;
}
