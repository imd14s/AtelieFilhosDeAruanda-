import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cartService } from './cartService';

describe('cartService', () => {
    const mockProduct = {
        id: '1',
        name: 'Vela de Sete Linhas',
        price: 45.90,
        images: ['/images/velas.png']
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
        expect(items[0].id).toBe('1');
        expect(items[0].quantity).toBe(1);
    });

    it('should increment quantity if product already in cart', async () => {
        await cartService.add(mockProduct, 1);
        await cartService.add(mockProduct, 2);
        const items = await cartService.get();
        expect(items).toHaveLength(1);
        expect(items[0].quantity).toBe(3);
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
        // There might be multiple events (sync, etc.) but we care about the type
        const events = dispatchSpy.mock.calls.map(call => call[0].type);
        expect(events).toContain('cart-updated');
    });
});
