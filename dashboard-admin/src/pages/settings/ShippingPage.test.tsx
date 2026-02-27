import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { ShippingPage } from './ShippingPage';
import { AdminProviderService } from '../../services/AdminProviderService';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { AdminServiceProvider } from '../../types/store-settings';

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
    const mockProviders: AdminServiceProvider[] = [
        { id: '1', name: 'Correios', code: 'CORREIOS', enabled: true, serviceType: 'SHIPPING', priority: 1, healthEnabled: true },
        { id: '2', name: 'Jadlog', code: 'JADLOG', enabled: false, serviceType: 'SHIPPING', priority: 2, healthEnabled: true }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AdminProviderService.listProviders).mockResolvedValue(mockProviders);
    });

    it('should render shipping providers correctly', async () => {
        render(<ShippingPage />);

        expect(await screen.findByText('Correios')).toBeInTheDocument();
        expect(screen.getByText('Jadlog')).toBeInTheDocument();
        expect(screen.getByText('Operacional')).toBeInTheDocument();
        expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('should toggle provider status', async () => {
        vi.mocked(AdminProviderService.toggleProvider).mockResolvedValue({
            data: { id: '1', name: 'Correios', code: 'CORREIOS', enabled: true, serviceType: 'SHIPPING', priority: 1, healthEnabled: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as unknown as InternalAxiosRequestConfig
        } as AxiosResponse);
        render(<ShippingPage />);

        const toggles = await screen.findAllByRole('checkbox');
        expect(toggles[0]).toBeDefined();
        fireEvent.click(toggles[0]!);

        await waitFor(() => {
            expect(AdminProviderService.toggleProvider).toHaveBeenCalledWith('1', false);
        });
    });

    it('should open config editor and save config', async () => {
        vi.mocked(AdminProviderService.getProviderConfig).mockResolvedValue({ providerId: '1', environment: 'PRODUCTION', configJson: '{"key": "value"}' });
        vi.mocked(AdminProviderService.saveProviderConfig).mockResolvedValue({
            data: { success: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as unknown as InternalAxiosRequestConfig
        } as AxiosResponse);

        render(<ShippingPage />);

        const configButtons = await screen.findAllByText('Configurar');
        expect(configButtons[0]).toBeDefined();
        fireEvent.click(configButtons[0]!);

        expect(await screen.findByText('Payload de Configuração (JSONB)')).toBeInTheDocument();

        const textArea = screen.getByPlaceholderText('{ "apiKey": "...", "token": "..." }');
        fireEvent.change(textArea, { target: { value: '{"key": "updated"}' } });

        const saveButton = screen.getByText('Salvar Alterações');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(AdminProviderService.saveProviderConfig).toHaveBeenCalledWith(expect.objectContaining({
                providerId: '1',
                configJson: '{"key":"updated"}'
            }));
        });
    });
});
