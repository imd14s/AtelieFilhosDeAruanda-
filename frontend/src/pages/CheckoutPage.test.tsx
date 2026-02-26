import { render, screen, fireEvent, waitFor } from '../test-utils';
import CheckoutPage from './CheckoutPage';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import React from 'react';
import { useLocation } from 'react-router-dom';

// Mock services
vi.mock('../services/cartService', () => ({
    cartService: {
        get: vi.fn(),
        clear: vi.fn(),
    },
}));

vi.mock('../services/orderService', () => ({
    orderService: {
        calculateShipping: vi.fn(),
        createOrder: vi.fn(),
    },
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn(() => ({ showToast: vi.fn() }))
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: { name: 'Test User', email: 'test@example.com' } }))
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: vi.fn(),
    };
});

describe('CheckoutPage Component', () => {
    const mockCart = [
        { id: '1', name: 'Vela de Arruda', price: 25, quantity: 2, image: '/images/vela.jpg' }
    ];

    const mockShipping = {
        price: 15,
        provider: 'Correios'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (cartService.get as Mock).mockResolvedValue(mockCart);
        (useLocation as Mock).mockReturnValue({
            state: { shippingSelected: mockShipping, cep: '' }
        });
    });

    it('should render cart items and totals correctly', async () => {
        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText('Vela de Arruda')).toBeInTheDocument();
            expect(screen.getByText('Qtd: 2')).toBeInTheDocument();
            expect(screen.getAllByText(/50,00/)[0]).toBeInTheDocument(); // Item total and Subtotal
            expect(screen.getByText(/15,00/)).toBeInTheDocument(); // Frete
            expect(screen.getByText(/65,00/)).toBeInTheDocument(); // Total
        });
    });

    it('should show message when cart is empty', async () => {
        (cartService.get as Mock).mockResolvedValue([]);
        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText('Sua sacola está vazia.')).toBeInTheDocument();
        });
    });

    it('should submit order successfully', async () => {
        (orderService.createOrder as Mock).mockResolvedValue({ id: 'ORD-123' });

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('E-mail para acompanhamento')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('E-mail para acompanhamento'), { target: { value: 'cliente@teste.com' } });
        fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Maria' } });
        fireEvent.change(screen.getByPlaceholderText('Sobrenome'), { target: { value: 'Silva' } });
        fireEvent.change(screen.getByPlaceholderText('Endereço e Número'), { target: { value: 'Rua das Flores, 123' } });
        fireEvent.change(screen.getByPlaceholderText('Cidade'), { target: { value: 'São Paulo' } });
        fireEvent.change(screen.getByPlaceholderText('UF'), { target: { value: 'SP' } });

        const submitButton = screen.getByText('Finalizar Pedido');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(orderService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
                email: 'cliente@teste.com',
                paymentMethod: 'pix' // Assumindo default
            }));
            expect(screen.getByText('Que o Axé te acompanhe!')).toBeInTheDocument();
            expect(screen.getByText(/ORD-123/)).toBeInTheDocument();
        });
    });
});
