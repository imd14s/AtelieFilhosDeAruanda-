import { render, screen, fireEvent, waitFor } from '../test-utils';
import CheckoutPage from './CheckoutPage';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { useLocation } from 'react-router-dom';
import { SafeAny } from "../types/safeAny";
import { useAuth } from '../context/AuthContext';

// Mock SEO
vi.mock('../components/SEO', () => ({
    default: ({ title }: { title: string }) => <div data-testid="seo">{title}</div>
}));

// Mock fiscal utils to skip validation logic in tests
vi.mock('../utils/fiscal', () => ({
    isValidCPF: vi.fn(() => true),
    isValidCNPJ: vi.fn(() => true),
    sanitizeDocument: vi.fn((doc: string) => doc.replace(/\D/g, ''))
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
        isAuthenticated: vi.fn().mockReturnValue(true),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
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
    useAuth: vi.fn(() => ({
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        addresses: [],
        cards: [],
        refreshAddresses: vi.fn(),
        refreshCards: vi.fn(),
        checkAuth: vi.fn(),
        login: vi.fn(),
        logout: vi.fn()
    }))
}));

vi.mock('../hooks/useMercadoPago', () => ({
    useMercadoPago: vi.fn(() => ({
        mp: { cardForm: vi.fn() },
        loading: false,
        isConfigured: true,
        pixActive: true,
        cardActive: true,
        pixDiscountPercent: 5,
        maxInstallments: 12,
        interestFree: 3,
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
        id: '1',
        price: 15,
        provider: 'Correios'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (cartService.get as Mock).mockResolvedValue(mockCart);
        (useLocation as Mock).mockReturnValue({
            state: { shippingSelected: mockShipping, cep: '01001000' }
        });
        (orderService.calculateShipping as Mock).mockResolvedValue([mockShipping]);
        localStorage.setItem('user', JSON.stringify({ id: 'user-123', name: 'Test User', email: 'test@example.com' }));
    });

    it('should render cart items and totals correctly', async () => {
        render(<CheckoutPage />);

        expect(await screen.findByText(/Vela de Arruda/i, {}, { timeout: 10000 })).toBeInTheDocument();

        // Find numbers in totals
        const totalsFound = await screen.findAllByText(/[0-9]+[.,][0-9]+/);
        const textContent = totalsFound.map(el => el.textContent).join(' ');

        expect(textContent).toContain('50');
        expect(textContent).toContain('15');
        expect(textContent).toContain('62');
    }, 15000);

    it('should show message when cart is empty', async () => {
        (cartService.get as Mock).mockResolvedValue([]);
        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText(/Sua sacola está vazia/i)).toBeInTheDocument();
        });
    });

    it('should submit order successfully', async () => {
        (orderService.createOrder as Mock).mockResolvedValue({ id: 'ORD-123' });

        render(<CheckoutPage />);

        // Fill contact
        const emailInput = await screen.findByPlaceholderText(/seu@email\.com/i, {}, { timeout: 10000 });
        fireEvent.change(emailInput, { target: { value: 'cliente@teste.com' } });

        // Fill fiscal
        const docInput = await screen.findByPlaceholderText(/000\.000\.000-00/i, {}, { timeout: 10000 });
        fireEvent.change(docInput, { target: { value: '12345678909' } });


        // Fill address details
        fireEvent.change(await screen.findByPlaceholderText(/^Nome$/i), { target: { value: 'Maria' } });
        fireEvent.change(await screen.findByPlaceholderText(/Sobrenome/i), { target: { value: 'Silva' } });
        fireEvent.change(await screen.findByPlaceholderText(/Logradouro e Número/i), { target: { value: 'Rua das Flores, 123' } });
        fireEvent.change(await screen.findByPlaceholderText(/Bairro/i), { target: { value: 'Centro' } });
        fireEvent.change(await screen.findByPlaceholderText(/Cidade/i), { target: { value: 'São Paulo' } });
        fireEvent.change(await screen.findByPlaceholderText(/UF/i), { target: { value: 'SP' } });

        const submitButton = await screen.findByText(/Finalizar Pedido/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(orderService.createOrder).toHaveBeenCalled();
            expect(screen.getByText(/Axé/i)).toBeInTheDocument();
            expect(screen.getByText(/ORD-123/)).toBeInTheDocument();
        }, { timeout: 10000 });
    }, 30000);

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

        (useAuth as Mock).mockReturnValue({
            user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
            isAuthenticated: true,
            addresses: [mockAddress],
            cards: [],
            refreshAddresses: vi.fn(),
            refreshCards: vi.fn(),
            checkAuth: vi.fn(),
            login: vi.fn(),
            logout: vi.fn()
        });

        render(<CheckoutPage />);

        expect(await screen.findByText(/Rua de Teste/i, {}, { timeout: 10000 })).toBeInTheDocument();
    }, 15000);

    it('should switch to credit card if PIX is disabled', async () => {
        const { useMercadoPago } = await import('../hooks/useMercadoPago');
        (useMercadoPago as Mock).mockReturnValue({
            mp: { cardForm: vi.fn() },
            loading: false,
            isConfigured: true,
            pixActive: false,
            cardActive: true,
            pixDiscountPercent: 0,
            maxInstallments: 12,
            interestFree: 3,
            error: null
        });

        render(<CheckoutPage />);

        await waitFor(() => {
            const cardRadio = screen.getByLabelText(/Cartão de Crédito/i) as HTMLInputElement;
            expect(cardRadio.checked).toBe(true);
        }, { timeout: 10000 });
    }, 15000);
});
