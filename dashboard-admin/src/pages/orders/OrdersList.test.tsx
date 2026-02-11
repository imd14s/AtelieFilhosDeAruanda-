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
        { id: 'ORD1', customerName: 'Cliente 1', total: 100, status: 'PAID', createdAt: '2024-02-10T10:00:00Z' },
        { id: 'ORD2', customerName: 'Cliente 2', total: 50, status: 'PENDING', createdAt: '2024-02-10T11:00:00Z' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (OrderService.getAll as any).mockResolvedValue(mockOrders);
    });

    it('should render orders list correctly', async () => {
        render(<OrdersPage />);

        expect(await screen.findByText('Cliente 1')).toBeInTheDocument();
        expect(screen.getByText('Cliente 2')).toBeInTheDocument();
        // Check for presence of formatted total (ignoring exact locale formatting)
        expect(screen.getByText(/100,00/)).toBeInTheDocument();
        expect(screen.getByText('PAID')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('should open cancel modal and cancel order', async () => {
        (OrderService.cancel as any).mockResolvedValue({});
        render(<OrdersPage />);

        const cancelButtons = await screen.findAllByTitle('Cancelar Pedido');
        fireEvent.click(cancelButtons[1]); // Cancel ORD2 (PENDING)

        expect(screen.getByText('Cancelar Pedido')).toBeInTheDocument();

        const textArea = screen.getByRole('textbox');
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
