export interface Category {
    id: string;
    name: string;
    slug?: string;
    description?: string;
}

export interface Variant {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    sku?: string;
    color?: string;
    size?: string;
}

export interface Product {
    id: string;
    name: string;
    title?: string; // API serializa name como title
    slug: string;
    description: string;
    price: number;
    image?: string;
    images?: string[];
    media?: { url: string }[];
    stockQuantity: number;
    stock?: number; // API serializa stockQuantity como stock
    categoryId: string | null;
    category?: Category | string;
    averageRating: number | null;
    totalReviews: number;
    variants: Variant[];
    active?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    photoUrl?: string;
    googleId?: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    variantId: string;
}

export interface Address {
    id?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    type?: string;
}

export interface OrderItem {
    productId: string;
    variantId: string | null;
    quantity: number;
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

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}
