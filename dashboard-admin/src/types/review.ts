export interface ReviewMedia {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
}

export interface Review {
    id: string;
    userId?: string;
    userName?: string;
    productId: string;
    productName?: string;
    rating: number;
    comment: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    verifiedPurchase: boolean;
    aiModerationScore?: number;
    adminResponse?: string;
    respondedAt?: string;
    createdAt: string;
    media: ReviewMedia[];
}
