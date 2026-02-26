import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cartService } from './cartService';
import { Product } from '../types';

describe('cartService', () => {
    const mockProduct: Product = {
        id: '1',
        name: 'Vela de Sete Linhas',
        price: 45.90,
        images: ['/images/velas.png'],
        description: 'Vela artesanal',
        categoryId: 'cat1',
        stockQuantity: 10,
        active: true,
        slug: 'vela-sete-linhas',
        averageRating: 0,
        totalReviews: 0,
        variants: []
    };

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with an empty cart', async () => {
        const items = await cartService.get();
        expect(items).toEqual([]);
    });

    it('should add a product to the cart', async () => {
        await cartService.add(mockProduct, 1);
        const items = await cartService.get();
        expect(items).toHaveLength(1);
        expect(items[0]?.id).toBe('1');
        expect(items[0]?.quantity).toBe(1);
    });

    it('should increment quantity if product already in cart', async () => {
        await cartService.add(mockProduct, 1);
        await cartService.add(mockProduct, 2);
        const items = await cartService.get();
        expect(items).toHaveLength(1);
        expect(items[0]?.quantity).toBe(3);
    });

    it('should remove a product from the cart', async () => {
        await cartService.add(mockProduct, 1);
        await cartService.remove('1');
        const items = await cartService.get();
        expect(items).toHaveLength(0);
    });

    it('should clear the cart', async () => {
        await cartService.add(mockProduct, 1);
        await cartService.clear();
        const items = await cartService.get();
        expect(items).toHaveLength(0);
    });

    it('should dispatch "cart-updated" event on changes', async () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        await cartService.add(mockProduct, 1);
        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
        const events = dispatchSpy.mock.calls.map(call => (call[0] as Event).type);
        expect(events).toContain('cart-updated');
    });
});
