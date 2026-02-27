/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from './ProductService';
import { api } from '../api/axios';

vi.mock('../api/axios', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
}));

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: () => 'mock-uuid'
    }
});

describe('ProductService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all products and map correctly', async () => {
        const mockData = [
            { id: '1', title: 'Prod 1', stockQuantity: 10, images: ['img1.jpg', 'vid.mp4'] },
            { id: '2', name: 'Prod 2', stock: 5, images: null }
        ];
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockData });

        const result = await ProductService.getAll();

        expect(api.get).toHaveBeenCalledWith('/products');
        expect(result).toHaveLength(2);

        // P1 Assertions
        expect(result[0]!.title).toBe('Prod 1');
        expect(result[0]!.stock).toBe(10);
        expect(result[0]!.media).toHaveLength(2);
        expect(result[0]!.media[0]!.type).toBe('IMAGE');
        expect(result[0]!.media[0]!.isMain).toBe(true);
        expect(result[0]!.media[1]!.type).toBe('VIDEO');
        expect(result[0]!.media[1]!.isMain).toBe(false);

        // P2 Assertions
        expect(result[1]!.title).toBe('Prod 2');
        expect(result[1]!.stock).toBe(5);
        expect(result[1]!.media).toEqual([]);
    });

    it('should handle getAll when data has content property', async () => {
        const mockData = { content: [{ id: '1' }] };
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockData });

        const result = await ProductService.getAll();
        expect(result).toHaveLength(1);
    });

    it('should fetch product by id and map correctly', async () => {
        const mockData = {
            id: '1',
            stockQuantity: 20,
            images: ['img1.jpg', 'vid.mov'],
            variants: [
                {
                    id: 'v1',
                    stockQuantity: 5,
                    attributesJson: '{"color":"red"}',
                    images: ['vimg1.jpg']
                },
                {
                    id: 'v2',
                    stockQuantity: 3,
                    attributes: { color: 'blue' },
                    images: null
                }
            ]
        };
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: mockData });

        const result = await ProductService.getById('1');

        expect(api.get).toHaveBeenCalledWith('/products/1');
        expect(result.stock).toBe(20);
        expect(result.media).toHaveLength(2);
        expect(result.media[0]!.id).toBe('mock-uuid');
        expect(result.media[0]!.type).toBe('IMAGE');

        expect(result.variants).toHaveLength(2);
        expect(result.variants[0]!.stock).toBe(5);
        expect(result.variants[0]!.attributes).toEqual({ color: 'red' });
        expect(result.variants[0]!.media).toHaveLength(1);

        expect(result.variants[1]!.attributes).toEqual({ color: 'blue' });
        expect(result.variants[1]!.media).toEqual([]);
    });

    it('should create product with form data', async () => {
        const fileMock = new File([''], 'test.png', { type: 'image/png' });
        const productDto = {
            title: 'New Product',
            price: 100,
            media: [{ id: 'media-1', file: fileMock }, { id: 'media-2', url: 'existing.jpg' }],
            variants: [{
                price: 100,
                media: [{ id: 'v-media-1', file: fileMock }]
            }]
        };

        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: { id: '1' } });

        await ProductService.create(productDto as any);

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith('/products', expect.any(FormData), {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const callArgs = (api.post as import('vitest').Mock).mock.calls[0];
        const formData = callArgs[1] as FormData;

        expect(formData.has('product')).toBe(true);
        expect(formData.has('images')).toBe(true);
    });

    it('should update product with form data', async () => {
        const productDto = { title: 'Update' };

        (api.put as import('vitest').Mock).mockResolvedValueOnce({});

        await ProductService.update('1', productDto as any);

        expect(api.put).toHaveBeenCalledWith('/products/1', expect.any(FormData), {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    });

    it('should toggle active status', async () => {
        (api.patch as import('vitest').Mock).mockResolvedValueOnce({});
        await ProductService.toggleActive('1');
        expect(api.patch).toHaveBeenCalledWith('/products/1/toggle');
    });

    it('should toggle alert', async () => {
        (api.put as import('vitest').Mock).mockResolvedValueOnce({});
        await ProductService.toggleAlert('1');
        expect(api.put).toHaveBeenCalledWith('/products/1/toggle-alert');
    });

    it('should delete product', async () => {
        (api.delete as import('vitest').Mock).mockResolvedValueOnce({});
        await ProductService.delete('1');
        expect(api.delete).toHaveBeenCalledWith('/products/1');
    });

    it('should generate description', async () => {
        const mockResponse = { title: 'T', description: 'Desc' };
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: mockResponse });

        const result = await ProductService.generateDescription('T', 'url');

        expect(result).toEqual(mockResponse);
        expect(api.post).toHaveBeenCalledWith('/products/generate-description', { title: 'T', imageUrl: 'url' });
    });
});
