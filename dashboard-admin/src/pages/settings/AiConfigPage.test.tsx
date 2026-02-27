import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AiConfigPage } from './AiConfigPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../api/axios';

vi.mock('../../api/axios', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('AiConfigPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load initial configs', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({
            data: [{ nomeIa: 'Gemini', apiKey: 'test-key', prePrompt: 'test-prompt' }]
        });

        render(<AiConfigPage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('test-key')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test-prompt')).toBeInTheDocument();
        });
    });

    it('should handle config load error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        (api.get as import('vitest').Mock).mockRejectedValue(new Error('Network error'));

        render(<AiConfigPage />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar configurações de IA:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('should save configs successfully', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({ data: [] });
        (api.post as import('vitest').Mock).mockResolvedValue({});

        render(<AiConfigPage />);

        const apiKeyInput = await screen.findByPlaceholderText('AIzaSyB...');
        fireEvent.change(apiKeyInput, { target: { value: 'new-key' } });

        const saveButton = await screen.findByRole('button', { name: /Salvar Configurações/i });
        fireEvent.submit(saveButton.closest('form')!);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/configs/ai', expect.objectContaining({ apiKey: 'new-key' }));
            expect(screen.getByText('Configurações salvas com sucesso!')).toBeInTheDocument();
        });
    });

    it('should handle save error', async () => {
        (api.get as import('vitest').Mock).mockResolvedValue({ data: [] });
        (api.post as import('vitest').Mock).mockRejectedValue({
            response: { data: { message: 'Api Key inválida' } }
        });

        render(<AiConfigPage />);

        const saveButton = await screen.findByRole('button', { name: /Salvar Configurações/i });
        fireEvent.submit(saveButton.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Api Key inválida')).toBeInTheDocument();
        });
    });
});
