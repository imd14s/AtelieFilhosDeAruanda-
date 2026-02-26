import { Address } from './address';

export interface OrderItem {
    productId: string;
    variantId: string | null;
    quantity: number;
    name?: string;
    productName?: string;
    price?: number;
    unitPrice?: number;
    subtotal?: number;
    image?: string;
    productImage?: string;
    product?: {
        id: string;
        name: string;
        title?: string;
        price: number;
        images?: string[];
    };
}

export interface CreateOrderData {
    customerName?: string;
    customerEmail?: string;
    nome?: string;
    sobrenome?: string;
    email?: string;
    items: OrderItem[];
    shippingAddress: Address | string;
    paymentMethod: string;
    paymentToken?: string | null;
    cardId?: string | null;
    saveCard?: boolean;
    saveAddress?: boolean;
    couponCode?: string | null;
}

export interface ShippingOption {
    provider: string;
    price: number;
    days: number;
    originalPrice?: number;
    free?: boolean;
}

export interface Order {
    id: string;
    number?: string;
    externalId?: string;
    status: string;
    total: number;
    totalAmount?: number;
    shippingCost?: number;
    discount?: number;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: Address | string;
    paymentMethod: string;
    paymentStatus?: string;
    trackingCode?: string;
}
