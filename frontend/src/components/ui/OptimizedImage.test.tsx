import { render, screen, fireEvent } from '../../test-utils';
import OptimizedImage from './OptimizedImage';
import { describe, it, expect } from 'vitest';

describe('OptimizedImage Component', () => {
    const defaultProps = {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        width: 300,
        height: 200
    };

    it('renders correctly with default props', () => {
        render(<OptimizedImage {...defaultProps} />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('alt', 'Test Image');
        expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('uses priority props correctly', () => {
        render(<OptimizedImage {...defaultProps} priority={true} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('loading', 'eager');
        expect(img).toHaveAttribute('fetchPriority', 'high');
    });

    it('generates semantic alt text with product context', () => {
        const productContext = {
            name: 'Vela de Arruda',
            category: 'Velas'
        };
        render(<OptimizedImage {...defaultProps} productContext={productContext} />);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('alt', 'Vela de Arruda - Velas - Ateliê Filhos de Aruanda');
    });

    it('shows default image on error', () => {
        render(<OptimizedImage {...defaultProps} />);
        const img = screen.getByRole('img');
        fireEvent.error(img);
        expect(img).toHaveAttribute('src', '/images/default.png');
    });
});
