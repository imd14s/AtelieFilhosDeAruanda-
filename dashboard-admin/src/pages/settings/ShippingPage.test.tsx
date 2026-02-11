import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { ShippingPage } from './ShippingPage';
import { AdminProviderService } from '../../services/AdminProviderService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AdminProviderService
vi.mock('../../services/AdminProviderService', () => ({
    AdminProviderService: {
        listProviders: vi.fn(),
        toggleProvider: vi.fn(),
        getProviderConfig: vi.fn(),
        saveProviderConfig: vi.fn(),
        createProvider: vi.fn(),
        deleteProvider: vi.fn(),
    }
}));

describe('ShippingPage Component', () => {
    const mockProviders = [
        { id: '1', name: 'Correios', code: 'CORREIOS', enabled: true, serviceType: 'SHIPPING' },
        { id: '2', name: 'Jadlog', code: 'JADLOG', enabled: false, serviceType: 'SHIPPING' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (AdminProviderService.listProviders as any).mockResolvedValue(mockProviders);
    });

    it('should render shipping providers correctly', async () => {
        render(<ShippingPage />);

        expect(await screen.findByText('Correios')).toBeInTheDocument();
        expect(screen.getByText('JADLOG')).toBeInTheDocument();
        expect(screen.getByText('Operacional')).toBeInTheDocument();
        expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('should toggle provider status', async () => {
        (AdminProviderService.toggleProvider as any).mockResolvedValue({});
        render(<ShippingPage />);

        const toggles = await screen.findAllByRole('checkbox');
        fireEvent.click(toggles[0]);

        await waitFor(() => {
            expect(AdminProviderService.toggleProvider).toHaveBeenCalledWith('1', false);
        });
    });

    it('should open config editor and save config', async () => {
        (AdminProviderService.getProviderConfig as any).mockResolvedValue({ configJson: '{"key": "value"}' });
        (AdminProviderService.saveProviderConfig as any).mockResolvedValue({});

        render(<ShippingPage />);

        const configButtons = await screen.findAllByText('Configurar');
        fireEvent.click(configButtons[0]);

        expect(await screen.findByText('Payload de Configuração (JSONB)')).toBeInTheDocument();

        const textArea = screen.getByPlaceholderText('{ "apiKey": "...", "token": "..." }');
        fireEvent.change(textArea, { target: { value: '{"key": "updated"}' } });

        const saveButton = screen.getByText('Salvar Alterações');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(AdminProviderService.saveProviderConfig).toHaveBeenCalledWith(expect.objectContaining({
                providerId: '1',
                configJson: '{"key": "updated"}'
            }));
        });
    });
});
