export interface ProductMedia {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    isMain: boolean;
    file?: File; // Para upload diferido
}

export interface ProductVariant {
    id: string;
    sku: string;
    price: number;
    promotionalPrice?: number;
    originalPrice?: number;
    stock: number;
    attributes: Record<string, string>;
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
    weight: number;
    width: number;
    height: number;
    length: number;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    active: boolean;
    alertEnabled?: boolean;
    category: string;
    price: number;
    promotionalPrice?: number;
    originalPrice?: number;
    stock: number;
    variants: ProductVariant[];
    media: ProductMedia[];
    marketplaceIds?: string[];
    dimensions?: ProductDimensions;
    seo?: ProductSEO;
    tenantId: string;
    ncm?: string;
    productionType?: 'PROPRIA' | 'REVENDA';
    origin?: string;
    createdAt: string;
    updatedAt: string;
}

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'active'> & {
    active?: boolean;
};
