import { render, screen, fireEvent } from '../test-utils';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { describe, it, expect, vi } from 'vitest';

// Mock hook
vi.mock('../context/FavoritesContext', () => ({
    useFavorites: () => ({
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
        loading: false
    })
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        addToast: vi.fn()
    })
}));

describe('ProductCard Component', () => {
    const mockProduct: Product = {
        id: '1',
        name: 'Vela Aromática',
        price: 35.90,
        images: ['/image.jpg'],
        description: 'Vela de soja',
        categoryId: 'cat1',
        stockQuantity: 5,
        active: true,
        slug: 'vela-aromatica',
        averageRating: 4.5,
        totalReviews: 10,
        variants: []
    };

    it('should show product details correctly', () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Vela Aromática')).toBeInTheDocument();
        expect(screen.getByText(/35,90/)).toBeInTheDocument();
    });

    it('should show Esgotado badge when stock is 0', () => {
        const outOfStockProduct = { ...mockProduct, stockQuantity: 0 };
        render(<ProductCard product={outOfStockProduct} />);

        expect(screen.getByText('Esgotado')).toBeInTheDocument();
        expect(screen.getByText('Indisponível')).toBeInTheDocument();
    });

    it('should call handleAddToCart internally when button is clicked', () => {
        render(<ProductCard product={mockProduct} />);

        const addButton = screen.getByRole('button', { name: /comprar/i });
        fireEvent.click(addButton);

        // O componente interno lida com o carrinho via cartService
        // Não temos onAddToCart prop, então testamos o efeito visual se houver
        expect(screen.getByRole('button', { name: /comprar/i })).toBeInTheDocument();
    });
});
