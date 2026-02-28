/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService, configService } from './orderService';
import api from './api';

vi.mock('./api');

describe('orderService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an order', async () => {
        const payload = {
            customerName: 'Test',
            email: 'test@mail.com',
            items: [{ productId: 'p1', quantity: 1 }],
            shippingAddress: { rua: 'X' },
            paymentMethod: 'pix'
        };
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: { id: '1' } });

        const result = await orderService.createOrder(payload as any);
        expect(result.id).toBe('1');
        expect(api.post).toHaveBeenCalled();
    });

    it('should fetch order by id', async () => {
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: { id: 'o1' } });
        const result = await orderService.getOrderById('o1');
        expect(result.id).toBe('o1');
    });

    it('should calculate shipping with complex options', async () => {
        const mockResp = { options: [{ name: 'Sedex', price: 10, delivery_time: 2 }] };
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: mockResp });

        const result = await orderService.calculateShipping('123', [{ id: 'p1', price: 100, quantity: 1 }] as any);
        expect(result![0]!.provider).toBe('Sedex');
        expect(result![0]!.price).toBe(10);
    });

    it('should calculate shipping with new List pattern format', async () => {
        const mockResp = [
            { provider: 'PAC', shippingCost: 15, estimatedDays: "5", freeShippingApplied: false },
            { provider: 'SEDEX', shippingCost: 30, estimatedDays: "2", freeShippingApplied: false }
        ];
        (api.post as import('vitest').Mock).mockResolvedValueOnce({ data: mockResp });

        const result = await orderService.calculateShipping('123', []);

        expect(result).toHaveLength(2);
        expect(result[0]!.provider).toBe('PAC');
        expect(result[0]!.price).toBe(15);
        expect(result[0]!.days).toBe(5);

        expect(result[1]!.provider).toBe('SEDEX');
        expect(result[1]!.price).toBe(30);
        expect(result[1]!.days).toBe(2);
    });

    describe('history', () => {
        it('should get history', async () => {
            (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: [{ product: { id: 'p1' } }] });
            const result = await orderService.history.get('u1');
            if (result && result.length > 0) {
                expect(result[0]!.id).toBe('p1');
            }
        });

        it('should add to history', async () => {
            (api.post as import('vitest').Mock).mockResolvedValueOnce({});
            await orderService.history.add('u1', 'p1');
            expect(api.post).toHaveBeenCalled();
        });

        it('should clear history', async () => {
            (api.delete as import('vitest').Mock).mockResolvedValueOnce({});
            await orderService.history.clear('u1');
            expect(api.delete).toHaveBeenCalled();
        });
    });
});

describe('configService', () => {
    it('should get mercado pago pk', async () => {
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: 'pk_mock' });
        const result = await configService.getMercadoPagoPublicKey();
        expect(result).toBe('pk_mock');
    });
});
