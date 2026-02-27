import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from './OrderService';
import { api } from '../api/axios';

vi.mock('../api/axios', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        defaults: {
            baseURL: 'http://localhost:8080/api'
        }
    }
}));

describe('OrderService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all orders correctly', async () => {
        const mockOrders = [{ id: '1', status: 'PENDING' }];
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: { content: mockOrders } });

        const result = await OrderService.getAll();
        expect(result).toEqual(mockOrders);
        expect(api.get).toHaveBeenCalledWith('/orders');
    });

    it('should return empty array if no content', async () => {
        (api.get as import('vitest').Mock).mockResolvedValueOnce({ data: {} });

        const result = await OrderService.getAll();
        expect(result).toEqual([]);
    });

    it('should handle errors on getAll', async () => {
        const error = new Error('Network error');
        (api.get as import('vitest').Mock).mockRejectedValueOnce(error);

        await expect(OrderService.getAll()).rejects.toThrow('Network error');
    });

    it('should cancel order', async () => {
        (api.put as import('vitest').Mock).mockResolvedValueOnce({});
        await OrderService.cancel('123', 'Motivo teste');
        expect(api.put).toHaveBeenCalledWith('/orders/123/cancel', 'Motivo teste', {
            headers: { 'Content-Type': 'text/plain' }
        });
    });

    it('should mark order as shipped', async () => {
        (api.put as import('vitest').Mock).mockResolvedValueOnce({});
        await OrderService.ship('123');
        expect(api.put).toHaveBeenCalledWith('/orders/123/ship');
    });

    it('should mark order as approved', async () => {
        (api.put as import('vitest').Mock).mockResolvedValueOnce({});
        await OrderService.approve('123');
        expect(api.put).toHaveBeenCalledWith('/orders/123/approve');
    });

    it('should mark order as delivered', async () => {
        (api.put as import('vitest').Mock).mockResolvedValueOnce({});
        await OrderService.delivered('123');
        expect(api.put).toHaveBeenCalledWith('/orders/123/delivered');
    });

    it('should emit invoice', async () => {
        (api.post as import('vitest').Mock).mockResolvedValueOnce({});
        await OrderService.emitInvoice('123');
        expect(api.post).toHaveBeenCalledWith('/admin/orders/123/invoice');
    });

    it('should generate XML url', () => {
        const url = OrderService.getXmlUrl('123');
        expect(url).toBe('http://localhost:8080/api/admin/orders/123/nfe/xml');
    });

    it('should generate DANFE url', () => {
        const url = OrderService.getDanfeUrl('123');
        expect(url).toBe('http://localhost:8080/api/admin/orders/123/nfe/danfe');
    });
});
