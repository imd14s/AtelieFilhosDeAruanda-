import { render, screen, fireEvent, waitFor } from '../test-utils';
import CheckoutPage from './CheckoutPage';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { useLocation } from 'react-router-dom';
import { SafeAny } from "../types/safeAny";

// Mock SEO
vi.mock('../components/SEO', () => ({
    default: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>
}));

// Mock services
vi.mock('../services/cartService', () => ({
    cartService: {
        get: vi.fn(() => Promise.resolve([])),
        clear: vi.fn(),
        add: vi.fn(),
        remove: vi.fn(),
        update: vi.fn(),
        migrate: vi.fn(() => Promise.resolve())
    },
}));

vi.mock('../services/authService', () => ({
    authService: {
        address: {
            create: vi.fn().mockResolvedValue({}),
            list: vi.fn().mockResolvedValue([]),
            get: vi.fn().mockResolvedValue([]),
        },
        cards: {
            get: vi.fn().mockResolvedValue([]),
            delete: vi.fn().mockResolvedValue(undefined),
        },
        user: {
            get: vi.fn(),
            update: vi.fn(),
        },
        getUser: vi.fn().mockReturnValue({ id: 'user-123', name: 'Test User', email: 'test@example.com' }),
        isAuthenticated: vi.fn().mockReturnValue(true)
    }
}));

vi.mock('../services/orderService', () => ({
    orderService: {
        calculateShipping: vi.fn(() => Promise.resolve([])),
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
        pixActive: true,
        cardActive: true,
        pixDiscountPercent: 5,
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
        const price50 = await screen.findAllByText(/50.*00/);
        expect(price50[0]).toBeInTheDocument();
        expect(screen.getByText(/15.*00/)).toBeInTheDocument();
        expect(screen.getByText(/62.*50/)).toBeInTheDocument(); // 50 - 5% (Pix) + 15 = 62.50
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
                paymentMethod: 'pix'
            }));
            expect(screen.getByText('Que o Axé te acompanhe!')).toBeInTheDocument();
            expect(screen.getByText(/ORD-123/)).toBeInTheDocument();
        });
    });

    it('should select an existing address from the list', async () => {
        const mockAddress = {
            id: 'addr-1',
            street: 'Rua de Teste',
            number: '123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01000-000',
            isDefault: true
        };

        const mockAuthService = vi.mocked(authService);
        (mockAuthService.address.get as Mock).mockResolvedValue([mockAddress]);

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText(/Rua de Teste/i)).toBeInTheDocument();
        });

        const addressCard = screen.getByText(/Rua de Teste/i).closest('div');
        if (addressCard) {
            fireEvent.click(addressCard);
        }
    });

    it('should switch to credit card if PIX is disabled', async () => {
        const { useMercadoPago } = await import('../hooks/useMercadoPago');
        (useMercadoPago as Mock).mockReturnValue({
            mp: { cardForm: vi.fn() },
            loading: false,
            isConfigured: true,
            pixActive: false,
            cardActive: true,
            pixDiscountPercent: 0,
            error: null
        });

        render(<CheckoutPage />);

        await waitFor(() => {
            const cardRadio = screen.getByLabelText(/Cartão de Crédito/i) as HTMLInputElement;
            expect(cardRadio.checked).toBe(true);
        });
    });
});
