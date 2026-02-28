import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { OrdersPage } from './OrdersList';
import { OrderService } from '../../services/OrderService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock OrderService
vi.mock('../../services/OrderService', () => ({
    OrderService: {
        getAll: vi.fn(),
        cancel: vi.fn(),
    }
}));

describe('OrdersPage Component', () => {
    const mockOrders = [
        { id: 'ORD1', customerName: 'Cliente 1', totalAmount: 100, status: 'PAID', createdAt: '2024-02-10T10:00:00Z' },
        { id: 'ORD2', customerName: 'Cliente 2', totalAmount: 50, status: 'PENDING', createdAt: '2024-02-10T11:00:00Z' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(OrderService.getAll).mockResolvedValue(mockOrders as any);
    });

    it('should render orders list correctly', async () => {
        render(<OrdersPage />);

        expect(await screen.findByText('Cliente 1')).toBeInTheDocument();
        expect(screen.getByText('Cliente 2')).toBeInTheDocument();
        // Check for presence of formatted total (ignoring exact locale formatting)
        expect(screen.getByText(/100/)).toBeInTheDocument();
        expect(screen.getByText('PAID')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('should open cancel modal from order details and cancel order', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(OrderService.cancel).mockResolvedValue({ status: 200 } as any);
        render(<OrdersPage />);

        // Click on the order row to open detail modal
        const row = await screen.findByText('Cliente 2');
        fireEvent.click(row);

        // Find cancel button inside the detail modal
        const detailCancelButton = await screen.findByRole('button', { name: /Cancelar Pedido/i });
        fireEvent.click(detailCancelButton);

        // Expect the cancel reason modal to open (wait for 200ms timeout from component)
        const modalTitle = await screen.findByText("Informe o motivo do cancelamento:", {}, { timeout: 1000 });
        expect(modalTitle).toBeInTheDocument();

        const textArea = screen.getByPlaceholderText(/Ex: Produto fora de estoque/i);
        fireEvent.change(textArea, { target: { value: 'Motivo de teste' } });

        const confirmButton = screen.getByText('Confirmar Cancelamento');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(OrderService.cancel).toHaveBeenCalledWith('ORD2', 'Motivo de teste');
            // Check if status updated in the list
            const cancelledStatus = screen.getAllByText('CANCELED');
            expect(cancelledStatus.length).toBeGreaterThan(0);
        });
    });
});
