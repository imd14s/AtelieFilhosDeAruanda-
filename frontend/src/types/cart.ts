export interface CartItem {
    id: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    variantId: string;
}

export interface Cart {
    items: CartItem[];
    total?: number;
}
