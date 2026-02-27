import { render, screen, fireEvent } from '../../test-utils';
import { MaskedInput } from './MaskedInput';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('MaskedInput Component', () => {
    it('renders correctly with label', () => {
        render(<MaskedInput mask="cpf" label="CPF Test" id="cpf-input" />);
        expect(screen.getByLabelText('CPF Test')).toBeInTheDocument();
    });

    it('applies CPF mask correctly while typing', () => {
        const handleChange = vi.fn();
        const { rerender } = render(<MaskedInput mask="cpf" value="" onChange={handleChange} />);

        const input = screen.getByRole('textbox') as HTMLInputElement;

        // Mocking user typing "12345678901"
        fireEvent.change(input, { target: { value: '12345678901' } });

        // onChange should be called with clean value
        expect(handleChange).toHaveBeenCalledWith('12345678901');

        // Rerender with formatted value to check display
        rerender(<MaskedInput mask="cpf" value="12345678901" onChange={handleChange} />);
        expect(input.value).toBe('123.456.789-01');
    });

    it('applies CNPJ mask correctly', () => {
        const { rerender } = render(<MaskedInput mask="cnpj" value="12345678000199" />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('12.345.678/0001-99');

        const handleChange = vi.fn();
        rerender(<MaskedInput mask="cnpj" value="12345678000199" onChange={handleChange} />);
        fireEvent.change(input, { target: { value: '987654321000188' } });
        expect(handleChange).toHaveBeenCalledWith('98765432100018'); // Limited to 14 chars
    });

    it('applies CEP mask correctly', () => {
        render(<MaskedInput mask="cep" value="12345678" />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('12345-678');
    });

    it('handles cpf-cnpj mask dynamically', () => {
        const { rerender } = render(<MaskedInput mask="cpf-cnpj" value="12345678901" />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('123.456.789-01');

        rerender(<MaskedInput mask="cpf-cnpj" value="12345678000199" />);
        expect(input.value).toBe('12.345.678/0001-99');
    });

    it('shows error message and error styles', () => {
        render(<MaskedInput mask="cpf" error="Invalid CPF" />);
        expect(screen.getByText('Invalid CPF')).toBeInTheDocument();
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-red-300');
    });

    it('maintains a ref to the input element', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<MaskedInput mask="cpf" ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('returns original value if mask is unknown (branch coverage)', () => {
        // @ts-expect-error - Testing fallback for invalid mask type
        render(<MaskedInput mask="invalid" value="hello" />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('hello');
    });

    it('handles empty value', () => {
        render(<MaskedInput mask="cpf" value={undefined} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('');
    });

    it('limits clean value length for all masks in handleChange', () => {
        const handleChange = vi.fn();
        const { rerender } = render(<MaskedInput mask="cpf" onChange={handleChange} />);
        const input = screen.getByRole('textbox');

        // CPF (11 digits)
        fireEvent.change(input, { target: { value: '1234567890123' } });
        expect(handleChange).toHaveBeenLastCalledWith('12345678901');

        // CNPJ (14 digits)
        rerender(<MaskedInput mask="cnpj" onChange={handleChange} />);
        fireEvent.change(input, { target: { value: '1234567800019900' } });
        expect(handleChange).toHaveBeenLastCalledWith('12345678000199');

        // CPF-CNPJ (14 digits)
        rerender(<MaskedInput mask="cpf-cnpj" onChange={handleChange} />);
        fireEvent.change(input, { target: { value: '1234567800019900' } });
        expect(handleChange).toHaveBeenLastCalledWith('12345678000199');

        // CEP (8 digits)
        rerender(<MaskedInput mask="cep" onChange={handleChange} />);
        fireEvent.change(input, { target: { value: '1234567890' } });
        expect(handleChange).toHaveBeenLastCalledWith('12345678');
    });

    it('covers applyMask with clean value length <= 11 and > 11 for cpf-cnpj', () => {
        const { rerender } = render(<MaskedInput mask="cpf-cnpj" value="12345678901234" />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('12.345.678/9012-34'); // formatting clean value length > 11

        rerender(<MaskedInput mask="cpf-cnpj" value="12345678901" />);
        expect(input.value).toBe('123.456.789-01'); // formatting clean value length <= 11
    });
});
