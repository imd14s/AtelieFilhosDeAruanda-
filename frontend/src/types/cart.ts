export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    variantId: string;
}

export interface Cart {
    items: CartItem[];
    total?: number;
}
