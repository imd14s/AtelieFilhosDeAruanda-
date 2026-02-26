import { render, screen, fireEvent, waitFor } from '../test-utils';
import CheckoutPage from './CheckoutPage';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock storeService
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

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: vi.fn(),
    };
});

import { useLocation } from 'react-router-dom';

describe('CheckoutPage Component', () => {
    const mockCart = {
        items: [
            { id: '1', name: 'Vela de Arruda', price: 25, quantity: 2, image: '/images/vela.jpg' }
        ]
    };

    const mockShipping = {
        price: 15,
        provider: 'Correios'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        cartService.get.mockResolvedValue(mockCart);
        useLocation.mockReturnValue({
            state: { shippingSelected: mockShipping, cep: '12345-678' }
        });
    });

    it('should render cart items and totals correctly', () => {
        render(<CheckoutPage />);

        expect(screen.getByText('Vela de Arruda')).toBeInTheDocument();
        expect(screen.getByText('Qtd: 2')).toBeInTheDocument();
        // Number format might vary by environment, checking for the presence of the values
        expect(screen.getAllByText(/50,00/)[0]).toBeInTheDocument(); // Item total and Subtotal
        expect(screen.getByText(/15,00/)).toBeInTheDocument(); // Frete
        expect(screen.getByText(/65,00/)).toBeInTheDocument(); // Total
    });

    it('should show message when cart is empty', () => {
        cartService.get.mockResolvedValue({ items: [] });
        render(<CheckoutPage />);

        expect(screen.getByText('Sua sacola está vazia.')).toBeInTheDocument();
    });

    it('should submit order successfully', async () => {
        orderService.createOrder.mockResolvedValue({ id: 'ORD-123' });

        render(<CheckoutPage />);

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
                customerEmail: 'cliente@teste.com',
                paymentMethod: 'pix'
            }));
            expect(screen.getByText('Que o Axé te acompanhe!')).toBeInTheDocument();
            expect(screen.getByText(/ORD-123/)).toBeInTheDocument();
        });
    });
});
