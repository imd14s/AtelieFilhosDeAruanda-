import { Address } from './address';

export interface OrderItem {
    productId: string;
    variantId: string | null;
    quantity: number;
    name?: string;
    price?: number;
    image?: string;
}

export interface CreateOrderData {
    customerName?: string;
    customerEmail?: string;
    nome?: string;
    sobrenome?: string;
    email?: string;
    items: OrderItem[];
    shippingAddress: Address;
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
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: Address;
    paymentMethod: string;
}
