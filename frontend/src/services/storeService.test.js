import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storeService } from './storeService';

describe('storeService.cart', () => {
    const mockProduct = {
        id: 1,
        name: 'Vela de Sete Linhas',
        price: 45.90,
        images: ['/images/velas.png']
    };

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with an empty cart', () => {
        const cart = storeService.cart.get();
        expect(cart.items).toEqual([]);
    });

    it('should add a product to the cart', () => {
        storeService.cart.add(mockProduct, 1);
        const cart = storeService.cart.get();
        expect(cart.items).toHaveLength(1);
        expect(cart.items[0].id).toBe(1);
        expect(cart.items[0].quantity).toBe(1);
    });

    it('should increment quantity if product already in cart', () => {
        storeService.cart.add(mockProduct, 1);
        storeService.cart.add(mockProduct, 2);
        const cart = storeService.cart.get();
        expect(cart.items).toHaveLength(1);
        expect(cart.items[0].quantity).toBe(3);
    });

    it('should remove a product from the cart', () => {
        storeService.cart.add(mockProduct, 1);
        storeService.cart.remove(1);
        const cart = storeService.cart.get();
        expect(cart.items).toHaveLength(0);
    });

    it('should clear the cart', () => {
        storeService.cart.add(mockProduct, 1);
        storeService.cart.clear();
        const cart = storeService.cart.get();
        expect(cart.items).toHaveLength(0);
    });

    it('should dispatch "cart-updated" event on changes', () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
        storeService.cart.add(mockProduct, 1);
        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
        expect(dispatchSpy.mock.calls[0][0].type).toBe('cart-updated');
    });
});
