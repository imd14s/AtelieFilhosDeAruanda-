import { render } from '../../test-utils';
import Spinner from './Spinner';
import { describe, it, expect } from 'vitest';

describe('Spinner Component', () => {
    it('renders correctly with default props', () => {
        render(<Spinner />);
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('width', '20');
        expect(svg).toHaveAttribute('height', '20');
        expect(svg).toHaveClass('animate-spin');
    });

    it('applies custom size correctly', () => {
        render(<Spinner size={40} />);
        const svg = document.querySelector('svg');
        expect(svg).toHaveAttribute('width', '40');
        expect(svg).toHaveAttribute('height', '40');
    });

    it('applies custom className correctly', () => {
        render(<Spinner className="text-red-500" />);
        const svg = document.querySelector('svg');
        expect(svg).toHaveClass('text-red-500');
    });
});
