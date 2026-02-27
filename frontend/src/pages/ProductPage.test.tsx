import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductPage from './ProductPage';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { HelmetProvider } from 'react-helmet-async';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';

vi.mock('../services/productService', () => ({
    productService: {
        getProductById: vi.fn(),
        getProducts: vi.fn(),
        getReviews: vi.fn()
    }
}));

vi.mock('../services/cartService', () => ({
    cartService: {
        add: vi.fn()
    }
}));

vi.mock('../services/authService', () => ({
    authService: {
        getUser: vi.fn()
    }
}));

vi.mock('../services/orderService', () => ({
    orderService: {
        history: { add: vi.fn() }
    }
}));

vi.mock('../context/FavoritesContext', () => ({
    useFavorites: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

// Mock ResizeObserver for some inner components if needed
vi.stubGlobal('ResizeObserver', class {
    observe() { }
    unobserve() { }
    disconnect() { }
});

describe('ProductPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (useFavorites as import('vitest').Mock).mockReturnValue({
            isFavorite: vi.fn().mockReturnValue(false),
            toggleFavorite: vi.fn(),
            loading: false
        });

        (useToast as import('vitest').Mock).mockReturnValue({
            addToast: vi.fn()
        });

        (authService.getUser as import('vitest').Mock).mockReturnValue({ id: 'user-123', name: 'Test User' });
    });

    const renderWithProviders = (ui: React.ReactElement, initialRoute = '/produto/1') => {
        return render(
            <HelmetProvider>
                <MemoryRouter initialEntries={[initialRoute]}>
                    <Routes>
                        <Route path="/produto/:id" element={ui} />
                    </Routes>
                </MemoryRouter>
            </HelmetProvider>
        );
    };

    it('should show loading initially', () => {
        (productService.getProductById as import('vitest').Mock)
            .mockImplementation(() => new Promise(() => {
                // Não resolve a promise para manter o estado de loading e prevenir NPEs assíncronos
            }));

        renderWithProviders(<ProductPage />);
        expect(screen.getByText('Carregando Axé...')).toBeInTheDocument();
    });

    it('should show not found if product does not exist', async () => {
        // Mock reject ao invés de resolve(null) para não invadir fluxos internos com objeto nulo e gerar null pointers
        (productService.getProductById as import('vitest').Mock).mockRejectedValueOnce(new Error("Not Found"));

        renderWithProviders(<ProductPage />);

        await waitFor(() => {
            expect(screen.getByText('Produto não encontrado.')).toBeInTheDocument();
        });
    });

    it('should render product details correctly', async () => {
        const mockProduct = {
            id: '1',
            name: 'Vela de 7 Dias',
            description: 'Vela artesanal branca.',
            price: 15.9,
            stockQuantity: 10,
            images: ['vela.jpg'],
            category: { name: 'Velas' },
            averageRating: 4.5,
            totalReviews: 2
        };

        (productService.getProductById as import('vitest').Mock).mockResolvedValueOnce(mockProduct);
        (productService.getProducts as import('vitest').Mock).mockResolvedValueOnce([]); // recommendations
        (productService.getReviews as import('vitest').Mock).mockResolvedValueOnce([]);

        renderWithProviders(<ProductPage />);

        await waitFor(() => {
            expect(screen.getByText('Vela de 7 Dias')).toBeInTheDocument();
            expect(screen.getByText(/R\$\s*15,90/)).toBeInTheDocument();
        });

        expect(orderService.history.add).toHaveBeenCalledWith('user-123', '1');
    });

    it('should add item to cart', async () => {
        const mockProduct = {
            id: '1',
            name: 'Guias de Umbanda',
            price: 50.0,
            stockQuantity: 5,
            images: ['guia.jpg'],
            category: { name: 'Guias' }
        };

        (productService.getProductById as import('vitest').Mock).mockResolvedValueOnce(mockProduct);
        (productService.getProducts as import('vitest').Mock).mockResolvedValueOnce([]);
        (productService.getReviews as import('vitest').Mock).mockResolvedValueOnce([]);

        renderWithProviders(<ProductPage />);

        const addToCartBtn = await screen.findByRole('button', { name: /Adicionar ao carrinho/i });
        fireEvent.click(addToCartBtn);

        expect(cartService.add).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            name: 'Guias de Umbanda'
        }), 1);
        expect(useToast().addToast).toHaveBeenCalledWith('Guias de Umbanda adicionado ao carrinho!', 'success');
    });

    it('should disable buy buttons when out of stock', async () => {
        const mockProduct = {
            id: '1',
            name: 'Incenso',
            price: 10.0,
            stockQuantity: 0,
            images: ['incenso.jpg'],
            category: 'Incensos'
        };

        (productService.getProductById as import('vitest').Mock).mockResolvedValueOnce(mockProduct);
        (productService.getProducts as import('vitest').Mock).mockResolvedValueOnce([]);
        (productService.getReviews as import('vitest').Mock).mockResolvedValueOnce([]);

        renderWithProviders(<ProductPage />);

        await waitFor(() => {
            expect(screen.getByText('Fora de Estoque')).toBeInTheDocument();
        });

        const buttons = screen.getAllByRole('button');
        const addToCartBtn = buttons.find(b => b.textContent?.includes('Adicionar ao carrinho'));
        expect(addToCartBtn).toBeDisabled();
    });
});
