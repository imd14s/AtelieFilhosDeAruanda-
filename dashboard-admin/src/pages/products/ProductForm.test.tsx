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
        (CategoryService.getAll as import('vitest').Mock).mockResolvedValue(mockCategories);
    });

    it('should render form fields correctly', async () => {
        render(<ProductForm />);

        expect(await screen.findByText('Novo Produto')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ex: Vestido Amarelo Ogum')).toBeInTheDocument();
        expect(screen.getByText('Por (R$)')).toBeInTheDocument();
        expect(screen.getByText('Categoria')).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
        render(<ProductForm />);

        const saveButton = await screen.findByRole('button', { name: /Salvar Produto/i });
        fireEvent.click(saveButton);

        expect(await screen.findByText('Título muito curto')).toBeInTheDocument();
        const categoryError = await screen.findByText(/Categoria obrigatória|Required|Expected string/i);
        expect(categoryError).toBeInTheDocument();
    });

    it('should submit form successfully with valid data', async () => {
        (ProductService.create as import('vitest').Mock).mockResolvedValueOnce({});

        render(<ProductForm />);

        // Wait for categories to load
        await waitFor(() => {
            expect(CategoryService.getAll).toHaveBeenCalled();
        });

        const selectPlaceholder = await screen.findByText('Selecione ou digite para adicionar uma categoria...');
        fireEvent.keyDown(selectPlaceholder, { key: 'ArrowDown' });
        const velasOption = await screen.findByText('Velas');
        fireEvent.click(velasOption);

        fireEvent.change(screen.getByPlaceholderText('Ex: Vestido Amarelo Ogum'), { target: { value: 'Vela Teste' } });
        fireEvent.change(screen.getByPlaceholderText('0.00 (ou herdar)'), { target: { value: '50' } });
        fireEvent.change(screen.getByPlaceholderText('0 (ou herdar)'), { target: { value: '10' } });
        fireEvent.change(screen.getByPlaceholderText('Busque por código ou nome...'), { target: { value: '12345678' } });

        // Add variant to the list so its values are submitted
        fireEvent.click(screen.getByRole('button', { name: /Adicionar Variante/i }));


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
