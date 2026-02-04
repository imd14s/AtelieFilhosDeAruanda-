export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  createdAt: string;
}

export interface CancelOrderDTO {
  reason: string;
}
