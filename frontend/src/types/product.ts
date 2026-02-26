export interface Category {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    active?: boolean;
    imageUrl?: string;
    media?: {
        mainMedia?: {
            image?: {
                url?: string;
            };
        };
    };
}

export interface Variant {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    sku?: string;
    color?: string;
    size?: string;
    attributesJson?: string;
    active?: boolean;
    imageUrl?: string;
    images?: string[];
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
    status?: string;
    product?: Partial<Product>;
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

export interface ProductQuestion {
    id: string;
    productId: string;
    userId: string;
    question: string;
    answer?: string;
    status: 'ANSWERED' | 'WAITING' | 'PENDING';
    createdAt: string;
    answeredAt?: string;
    product?: Partial<Product>;
}
