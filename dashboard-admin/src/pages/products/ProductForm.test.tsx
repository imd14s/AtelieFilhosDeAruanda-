import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { ProductForm } from './ProductForm';
import { CategoryService } from '../../services/CategoryService';
import { ProductService } from '../../services/ProductService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ProductForm Component', () => {
    const mockCategories = [
        { id: '1', name: 'Velas' },
        { id: '2', name: 'Incensos' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (CategoryService.getAll as any).mockResolvedValue(mockCategories);
    });

    it('should render form fields correctly', async () => {
        render(<ProductForm />);

        expect(await screen.findByText('Novo Produto')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ex: Camiseta Branca')).toBeInTheDocument();
        expect(screen.getByLabelText('Preço Base (R$)')).toBeInTheDocument();
        expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
        render(<ProductForm />);

        const saveButton = await screen.findByRole('button', { name: /Salvar Produto/i });
        fireEvent.click(saveButton);

        expect(await screen.findByText('Título muito curto')).toBeInTheDocument();
        expect(await screen.findByText('Categoria obrigatória')).toBeInTheDocument();
    });

    it('should submit form successfully with valid data', async () => {
        (ProductService.create as any).mockResolvedValueOnce({});

        render(<ProductForm />);

        // Wait for categories to load
        await screen.findByText('Velas');

        fireEvent.change(screen.getByPlaceholderText('Ex: Camiseta Branca'), { target: { value: 'Vela Teste' } });
        fireEvent.change(screen.getByLabelText('Preço Base (R$)'), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText('Estoque Total'), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: '1' } });

        const saveButton = screen.getByRole('button', { name: /Salvar Produto/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(ProductService.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Vela Teste',
                price: 50,
                stock: 10,
                category: '1'
            }));
        });
    });
});
