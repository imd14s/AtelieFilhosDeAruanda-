import { render, screen, fireEvent } from '../../test-utils';
import Button from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);

        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state and disables button', () => {
        render(<Button isLoading>Click Me</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        // The span wrapping the text should have opacity-0
        expect(screen.getByText('Click Me')).toHaveClass('opacity-0');
    });

    it('applies variant styles correctly', () => {
        const { rerender } = render(<Button variant="primary">Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-[#0f2A44]');

        rerender(<Button variant="gold">Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-[#C9A24D]');

        rerender(<Button variant="outline">Button</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
