import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import ProductCard from './ProductCard';
import { cartService } from '../services/cartService';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock storeService
vi.mock('../services/cartService', () => ({
    cartService: {
        add: vi.fn().mockResolvedValue([]),
    },
}));

describe('ProductCard Component', () => {
    const mockProduct = {
        id: 1,
        name: 'Vela de Sete Linhas',
        price: 45.90,
        images: ['/images/velas.png'],
        stockQuantity: 10,
    };

    const outOfStockProduct = {
        ...mockProduct,
        id: 2,
        stockQuantity: 0,
    };

    it('should render product information correctly', () => {
        render(<ProductCard product={mockProduct} />);
        expect(screen.getByText('Vela de Sete Linhas')).toBeInTheDocument();
        expect(screen.getByText('R$ 45,90')).toBeInTheDocument();
        expect(screen.getByText('Ateliê Aruanda')).toBeInTheDocument();
    });

    it('should call cartService.add when clicking "Comprar"', async () => {
        vi.useFakeTimers();
        render(<ProductCard product={mockProduct} />);

        const buyButton = screen.getByText('Comprar');
        fireEvent.click(buyButton);

        // Advance 300ms to trigger the cart addition
        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(cartService.add).toHaveBeenCalledWith(mockProduct, 1);
        vi.useRealTimers();
    });

    it('should change button state to "Na Sacola" after adding', async () => {
        vi.useFakeTimers();
        render(<ProductCard product={mockProduct} />);

        const buyButton = screen.getByText('Comprar');
        fireEvent.click(buyButton);

        // Advance 300ms to trigger state change to "added"
        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(screen.getByText('Na Sacola')).toBeInTheDocument();

        // Advance another 2000ms to see it reverting
        await act(async () => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByText('Comprar')).toBeInTheDocument();

        vi.useRealTimers();
    });

    it('should disable button and show "Esgotado" when out of stock', () => {
        render(<ProductCard product={outOfStockProduct} />);

        expect(screen.getByText('Esgotado')).toBeInTheDocument();
        const button = screen.getByRole('button', { name: /Indisponível/i });
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Indisponível');
    });
});
