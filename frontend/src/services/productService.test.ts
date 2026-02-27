import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService, normalizeProduct } from './productService';
import api from './api';

vi.mock('./api');

describe('productService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('normalizeProduct', () => {
        it('should normalize product gracefully', () => {
            const raw = {
                id: '1',
                title: 'Test',
                stockQuantity: 10,
                category: { id: 'c1' },
                variants: [{ id: 'v1', stock: 5 }]
            };
            const result = normalizeProduct(raw);
            expect(result.name).toBe('Test');
            expect(result.stockQuantity).toBe(10);
            if (result && result.variants && result.variants.length > 0) {
                expect(result.variants[0]!.id).toBe('v1');
                expect(result.variants[0]!.stockQuantity).toBe(5);
            }
        });

        it('should handle missing fields', () => {
            const result = normalizeProduct({});
            expect(result.name).toBe('');
            expect(result.stockQuantity).toBe(0);
            expect(result.categoryId).toBeNull();
            expect(result.variants).toEqual([]);
        });

        it('should return null if invalid data', () => {
            expect(normalizeProduct(null)).toBeNull();
        });
    });

    it('should fetch products with filters', async () => {
        const mockRawProducts = [{ id: '1', title: 'Prod' }];
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: { content: mockRawProducts } });

        const result = await productService.getProducts({ categoryId: 'c1', search: 'P' });

        expect(api.get).toHaveBeenCalledWith('/products', expect.objectContaining({
            params: expect.any(URLSearchParams)
        }));
        if (result && result.length > 0) {
            expect(result[0]!.id).toBe('1');
            expect(result[0]!.name).toBe('Prod');
        }
    });

    it('should fetch product by id', async () => {
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: { id: '1', title: 'A' } });
        const result = await productService.getProductById('1');
        expect(result.name).toBe('A');
    });

    it('should get categories', async () => {
        const mockCats = [{ id: 'c1', name: 'Cat' }];
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockCats });
        const result = await productService.getCategories();
        expect(result).toEqual(mockCats);
    });

    it('should get reviews', async () => {
        const mockReviews = [{ id: 'r1', rating: 5 }];
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockReviews });
        const result = await productService.getReviews('1');
        expect(result).toEqual(mockReviews);
    });

    it('should create review', async () => {
        const mockPayload = { rating: 5, comment: 'Good' };
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: { success: true } });
        const result = await productService.createReview(mockPayload);
        expect(result.success).toBe(true);
    });

    it('should validate review token', async () => {
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: { valid: true } });
        const result = await productService.validateReviewToken('tok');
        expect(result.valid).toBe(true);
    });

    it('should create verified review', async () => {
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: { success: true } });
        const result = await productService.createVerifiedReview({});
        expect(result.success).toBe(true);
    });
});
