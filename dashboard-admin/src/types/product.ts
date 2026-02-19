export interface ProductMedia {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    isMain: boolean;
}

export interface ProductVariant {
    id: string;
    sku: string;
    price: number;
    promotionalPrice?: number;
    stock: number;
    attributes: Record<string, string>; // e.g. { color: "Red", size: "M" }
    imageUrl?: string;
    media?: ProductMedia[];
}

export interface ProductSEO {
    slug: string;
    title?: string;
    description?: string;
    tags: string[];
}

export interface ProductDimensions {
    weight: number; // in grams
    width: number; // in cm
    height: number; // in cm
    length: number; // in cm
}

export interface Product {
    id: string;
    title: string;
    description: string;
    active: boolean;
    alertEnabled?: boolean;
    category: string;

    // Pricing & Stock (can be overridden by variants)
    price: number;
    promotionalPrice?: number;
    stock: number;

    variants: ProductVariant[];
    media: ProductMedia[];

    marketplaceIds?: string[]; // IDs dos marketplaces associados

    dimensions?: ProductDimensions;
    seo?: ProductSEO;

    tenantId: string;
    createdAt: string;
    updatedAt: string;
}

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'active'> & {
    active?: boolean;
};
