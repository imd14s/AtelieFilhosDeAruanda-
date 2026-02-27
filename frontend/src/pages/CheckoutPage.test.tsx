import { render, screen, fireEvent, waitFor } from '../test-utils';
import CheckoutPage from './CheckoutPage';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useLocation } from 'react-router-dom';
import { SafeAny } from "../types/safeAny";

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
    configService: {
        getMercadoPagoPublicKey: vi.fn(() => Promise.resolve({ publicKey: 'TEST_KEY' })),
    }
}));

vi.mock('../services/marketingService', () => ({
    marketingService: {
        trackEvent: vi.fn(),
        getAutomations: vi.fn(() => Promise.resolve([])),
    }
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn(() => ({ showToast: vi.fn() }))
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: { name: 'Test User', email: 'test@example.com' } }))
}));

vi.mock('../hooks/useMercadoPago', () => ({
    useMercadoPago: vi.fn(() => ({
        mp: { cardForm: vi.fn() },
        loading: false,
        isConfigured: true,
        error: null
    }))
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<SafeAny>('react-router-dom');
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
        // Mock user in localStorage for CheckoutPage and cartService
        localStorage.setItem('user', JSON.stringify({ id: 'user-123', name: 'Test User', email: 'test@example.com' }));

        render(<CheckoutPage />);

        // Use findByText for better async handling and case-insensitive regex
        expect(await screen.findByText(/Vela de Arruda/i)).toBeInTheDocument();
        expect(await screen.findByText(/Qtd: 2/i)).toBeInTheDocument();

        // Totals
        expect(screen.getAllByText(/50,00/)[0]).toBeInTheDocument();
        expect(screen.getByText(/15,00/)).toBeInTheDocument();
        expect(screen.getByText(/65,00/)).toBeInTheDocument();
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
        fireEvent.change(screen.getByPlaceholderText('000.000.000-00 ou 00.000.000/0000-00'), { target: { value: '12345678909' } });

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
