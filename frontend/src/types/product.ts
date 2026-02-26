export interface Category {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    active?: boolean;
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

export interface Review {
    id: string;
    productId: string;
    userId?: string;
    userName?: string;
    user?: {
        name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
    images?: string[];
}

export interface CreateReviewData {
    productId: string;
    rating: number;
    comment: string;
    media?: {
        url: string;
        type: 'IMAGE' | 'VIDEO';
    }[];
}

export interface Product {
    id: string;
    name: string;
    title?: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
    image?: string;
    images?: string[];
    media?: { url: string }[];
    stockQuantity: number;
    stock?: number;
    categoryId: string | null;
    category?: Category | string;
    averageRating: number | null;
    totalReviews: number;
    variants: Variant[];
    active?: boolean;
}
