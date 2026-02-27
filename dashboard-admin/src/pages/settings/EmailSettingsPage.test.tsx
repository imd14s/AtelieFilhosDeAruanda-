import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailSettingsPage } from './EmailSettingsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../api/axios';

vi.mock('../../api/axios', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('EmailSettingsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load initial configs', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({
            data: { mailSenderName: 'Ateliê', mailSenderAddress: 'test@atelie.com', mailHost: 'smtp.test.com', mailPort: 587, mailUsername: 'user1', mailPassword: 'password123' }
        });

        const { container } = render(<EmailSettingsPage />);
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByDisplayValue('Ateliê')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@atelie.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('smtp.test.com')).toBeInTheDocument();
        });
    });

    it('should save configs successfully', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({ data: {} });
        (api.post as import('vitest').Mock).mockResolvedValue({});

        render(<EmailSettingsPage />);

        const nameInput = await screen.findByPlaceholderText(/Ex: Ateliê Filhos de/i);
        fireEvent.change(nameInput, { target: { value: 'Novo Nome' } });

        const saveButton = await screen.findByRole('button', { name: /Salvar e Ativar/i });
        fireEvent.submit(saveButton.closest('form')!);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/marketing/email-settings', expect.objectContaining({ mailSenderName: 'Novo Nome' }));
            expect(screen.getByText('Configurações de e-mail atualizadas com sucesso!')).toBeInTheDocument();
        });
    });

    it('should handle save error', async () => {
        (api.get as import('vitest').Mock).mockRejectedValue(new Error('not found'));
        (api.post as import('vitest').Mock).mockRejectedValue(new Error('error'));

        render(<EmailSettingsPage />);

        const saveButton = await screen.findByRole('button', { name: /Salvar e Ativar/i });
        fireEvent.submit(saveButton.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/Ocorreu um erro ao salvar/i)).toBeInTheDocument();
        });
    });

    it('should change host via suggestion select', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({ data: {} });

        render(<EmailSettingsPage />);

        const select = await screen.findByRole('combobox');
        fireEvent.change(select, { target: { value: 'Gmail' } });

        expect(screen.getByDisplayValue('smtp.gmail.com')).toBeInTheDocument();
    });

    it('should toggle password visibility', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({ data: {} });

        render(<EmailSettingsPage />);

        const toggleBtn = await screen.findByText('Mostrar');
        fireEvent.click(toggleBtn);

        expect(screen.getByText('Esconder')).toBeInTheDocument();
        const pwInput = screen.getByPlaceholderText('••••••••••••');
        expect(pwInput).toHaveAttribute('type', 'text');
    });
});
