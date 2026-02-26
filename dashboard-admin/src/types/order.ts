export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  createdAt: string;
  labelUrlMe?: string;
  labelUrlCustom?: string;
  invoiceUrl?: string;
  trackingCode?: string;
  shippingIdExternal?: string;
  customerDocument?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
  variantId?: string;
}

export interface CancelOrderDTO {
  reason: string;
}
