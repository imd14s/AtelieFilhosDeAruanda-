/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '../test-utils';
import CartDrawer from './CartDrawer';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';

vi.mock('../services/cartService', () => ({
    cartService: {
        remove: vi.fn(),
        updateQuantity: vi.fn()
    }
}));

vi.mock('../services/orderService', () => ({
    orderService: {
        calculateShipping: vi.fn()
    }
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        addToast: vi.fn()
    })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('CartDrawer Component', () => {
    const mockOnClose = vi.fn();
    const mockOnUpdateCart = vi.fn();

    const mockCartItems = [
        { id: '1', name: 'Vela Aromática', price: 50, quantity: 2, image: 'vela.jpg', productId: 'p1' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        const { container } = render(
            <CartDrawer isOpen={false} onClose={mockOnClose} cartItems={[]} onUpdateCart={mockOnUpdateCart} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should show empty state when cart is empty', () => {
        render(
            <CartDrawer isOpen={true} onClose={mockOnClose} cartItems={[]} onUpdateCart={mockOnUpdateCart} />
        );
        expect(screen.getByText('Sua sacola está vazia')).toBeInTheDocument();
    });

    it('should list cart items and calculate subtotal', () => {
        render(
            <CartDrawer isOpen={true} onClose={mockOnClose} cartItems={mockCartItems as any} onUpdateCart={mockOnUpdateCart} />
        );
        const items = screen.getAllByTestId('cart-item');
        expect(items![0]).toHaveTextContent('Vela Aromática');
        // 50 * 2 = 100
        const subtotals = screen.getAllByText(/100,00/i);
        expect(subtotals.length).toBeGreaterThan(0);
    });

    it('should calculate shipping', async () => {
        (orderService.calculateShipping as import('vitest').Mock).mockResolvedValueOnce([
            { provider: 'SEDEX', price: 20, days: 3 }
        ]);

        render(
            <CartDrawer isOpen={true} onClose={mockOnClose} cartItems={mockCartItems as any} onUpdateCart={mockOnUpdateCart} />
        );

        const input = screen.getByPlaceholderText('00000-000');
        fireEvent.change(input, { target: { value: '01001-000' } });

        const calcBtn = screen.getByRole('button', { name: /Calcular/i });
        fireEvent.click(calcBtn);

        await waitFor(() => {
            expect(screen.getByText('SEDEX')).toBeInTheDocument();
        });

        // Select shipping and check total
        const radio = screen.getByRole('radio');
        fireEvent.click(radio);

        // 100 + 20 = 120
        expect(screen.getByText(/120,00/i)).toBeInTheDocument();
    });

    it('should update item quantity', async () => {
        (cartService.updateQuantity as import('vitest').Mock).mockResolvedValueOnce([]);

        render(
            <CartDrawer isOpen={true} onClose={mockOnClose} cartItems={mockCartItems as any} onUpdateCart={mockOnUpdateCart} />
        );

        const plusBtn = screen.getByText('+');
        fireEvent.click(plusBtn);

        await waitFor(() => {
            expect(cartService.updateQuantity).toHaveBeenCalledWith('1', 3);
            expect(mockOnUpdateCart).toHaveBeenCalled();
        });
    });

    it('should remove item', async () => {
        (cartService.remove as import('vitest').Mock).mockResolvedValueOnce([]);

        render(
            <CartDrawer isOpen={true} onClose={mockOnClose} cartItems={mockCartItems as any} onUpdateCart={mockOnUpdateCart} />
        );

        // Find delete button
        const removeBtn = screen.getAllByRole('button').find(btn =>
            btn.querySelector('svg.lucide-trash-2') ||
            btn.innerHTML.includes('lucide-trash-2')
        );
        fireEvent.click(removeBtn!);

        await waitFor(() => {
            expect(cartService.remove).toHaveBeenCalled();
        });
    });
});
