import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { PaymentPage } from './PaymentPage';
import { AdminProviderService } from '../../services/AdminProviderService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AdminProviderService
vi.mock('../../services/AdminProviderService', () => ({
    AdminProviderService: {
        listProviders: vi.fn(),
        toggleProvider: vi.fn(),
        saveProviderConfig: vi.fn(),
        deleteProvider: vi.fn(),
        createProvider: vi.fn(),
    }
}));

// Mock MercadoPagoForm to avoid deep testing it here
vi.mock('./components/MercadoPagoForm', () => ({
    MercadoPagoForm: ({ onSave }: any) => (
        <button onClick={() => onSave({ publicKey: 'test', accessToken: 'test' })}>
            Mock Save MP Config
        </button>
    )
}));

describe('PaymentPage Component', () => {
    const mockProviders = [
        { id: '1', name: 'Mercado Pago', code: 'MERCADO_PAGO', enabled: true, serviceType: 'PAYMENT' },
        { id: '2', name: 'PIX Standalone', code: 'PIX', enabled: true, serviceType: 'PAYMENT' } // Should be filtered out
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (AdminProviderService.listProviders as any).mockResolvedValue(mockProviders);
    });

    it('should render payment providers correctly and filter out standalone PIX', async () => {
        render(<PaymentPage />);

        expect(await screen.findByText('Mercado Pago')).toBeInTheDocument();
        expect(screen.queryByText('PIX Standalone')).toBeNull();
    });

    it('should open MercadoPagoForm and save config', async () => {
        (AdminProviderService.saveProviderConfig as any).mockResolvedValue({});
        render(<PaymentPage />);

        const configButton = await screen.findByText('Configurar');
        fireEvent.click(configButton);

        const mockSaveButton = screen.getByText('Mock Save MP Config');
        fireEvent.click(mockSaveButton);

        await waitFor(() => {
            expect(AdminProviderService.saveProviderConfig).toHaveBeenCalledWith(expect.objectContaining({
                providerId: '1',
                configJson: JSON.stringify({ publicKey: 'test', accessToken: 'test' })
            }));
        });
    });
});
