import { render, screen, fireEvent, waitFor } from '../test-utils';
import CheckoutPage from './CheckoutPage';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import React from 'react';
import { useLocation } from 'react-router-dom';

// Mock services
vi.mock('../services/authService', () => ({
    authService: {
        address: { get: vi.fn().mockResolvedValue([]) },
        cards: { get: vi.fn().mockResolvedValue([]) }
    }
}));

vi.mock('../services/cartService', () => ({
    cartService: {
        get: vi.fn(),
        clear: vi.fn(),
    },
}));

vi.mock('../services/orderService', async () => {
    const actual = await vi.importActual<any>('../services/orderService');
    return {
        ...actual,
        orderService: {
            calculateShipping: vi.fn(),
            createOrder: vi.fn(),
        },
    };
});

vi.mock('../context/ToastContext', async () => {
    const actual = await vi.importActual<any>('../context/ToastContext');
    return {
        ...actual,
        useToast: vi.fn(() => ({ addToast: vi.fn(), removeToast: vi.fn() }))
    };
});

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: null }))
}));

vi.mock('../hooks/useMercadoPago', () => ({
    useMercadoPago: vi.fn(() => ({
        mp: {},
        loading: false,
        isConfigured: true,
        error: null,
        config: {
            pixActive: true,
            cardActive: true,
            maxInstallments: 12,
            interestFree: 3,
            pixDiscountPercent: 5
        }
    }))
}));

vi.mock('../utils/imageUtils', () => ({
    getImageUrl: vi.fn(() => 'http://localhost/images/fake.jpg'),
    isVideoUrl: vi.fn(() => false),
    getFirstImageFromList: vi.fn(() => 'http://localhost/images/fake.jpg')
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
        { id: '1', name: 'Vela de Arruda', price: 25, quantity: 2, images: ['/images/vela.jpg'] }
    ];

    const mockShipping = {
        price: 15,
        provider: 'Correios'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (cartService.get as Mock).mockResolvedValue(mockCart);
        (useLocation as Mock).mockReturnValue({
            state: { shippingSelected: mockShipping, cep: '' }
        });
        localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com', name: 'Test User' }));
    });

    it('should render cart items and totals correctly', async () => {
        render(<CheckoutPage />);

        // Wait for the cart to load
        await waitFor(() => {
            expect(screen.getByText(/Vela de Arruda/i)).toBeInTheDocument();
            expect(screen.getByText(/Qtd: 2/i)).toBeInTheDocument();
            expect(screen.getAllByText(/50/i)[0]).toBeInTheDocument(); // Item total and Subtotal
            expect(screen.getByText(/15/i)).toBeInTheDocument(); // Frete
            expect(screen.getByText(/62/i)).toBeInTheDocument(); // Total
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
            expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('exemplo@email.com'), { target: { value: 'cliente@teste.com' } });
        fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'Maria' } });
        fireEvent.change(screen.getByPlaceholderText('Seu sobrenome'), { target: { value: 'Silva' } });
        fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '12345678909' } });
        fireEvent.change(screen.getByPlaceholderText('Nome da rua'), { target: { value: 'Rua das Flores' } });
        fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });
        fireEvent.change(screen.getByPlaceholderText('Bairro'), { target: { value: 'Centro' } });
        fireEvent.change(screen.getByPlaceholderText('00000-000'), { target: { value: '01000-000' } });
        fireEvent.change(screen.getByPlaceholderText('Cidade'), { target: { value: 'São Paulo' } });
        fireEvent.change(screen.getByPlaceholderText('UF'), { target: { value: 'SP' } });

        console.log("DOM ANTES DO FINALIZAR:", document.body.innerHTML);
        
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
