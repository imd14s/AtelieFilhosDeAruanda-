import { render, screen, fireEvent } from '../../test-utils';
import { StoreSelector } from './StoreSelector';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TenantContext from '../../context/TenantContext';

vi.mock('../../context/TenantContext', async () => {
    const actual = await vi.importActual('../../context/TenantContext');
    return {
        ...actual,
        useTenant: vi.fn(),
    };
});

describe('StoreSelector Component', () => {
    const mockSwitchTenant = vi.fn();
    const mockTenants = [
        { id: '1', name: 'Loja 1', slug: 'loja-1' },
        { id: '2', name: 'Loja 2', slug: 'loja-2' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state', () => {
        (TenantContext.useTenant as import('vitest').Mock).mockReturnValue({
            isLoading: true,
            currentTenant: null,
            tenants: [],
            switchTenant: mockSwitchTenant
        });

        const { container } = render(<StoreSelector />);
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should return null if no current tenant', () => {
        (TenantContext.useTenant as import('vitest').Mock).mockReturnValue({
            isLoading: false,
            currentTenant: null,
            tenants: [],
            switchTenant: mockSwitchTenant
        });

        render(<StoreSelector />);
        expect(screen.queryByText('Loja Atual')).not.toBeInTheDocument();
    });

    it('should render current tenant name', () => {
        (TenantContext.useTenant as import('vitest').Mock).mockReturnValue({
            isLoading: false,
            currentTenant: mockTenants[0],
            tenants: mockTenants,
            switchTenant: mockSwitchTenant
        });

        render(<StoreSelector />);
        expect(screen.getByText('Loja 1')).toBeInTheDocument();
        expect(screen.getByText('Loja Atual')).toBeInTheDocument();
    });

    it('should open dropdown and show tenants', () => {
        (TenantContext.useTenant as import('vitest').Mock).mockReturnValue({
            isLoading: false,
            currentTenant: mockTenants[0],
            tenants: mockTenants,
            switchTenant: mockSwitchTenant
        });

        render(<StoreSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Suas Lojas')).toBeInTheDocument();
        expect(screen.getAllByText('Loja 1').length).toBeGreaterThan(1); // One in button, one in list
        expect(screen.getByText('Loja 2')).toBeInTheDocument();
    });

    it('should call switchTenant when clicking an option', () => {
        (TenantContext.useTenant as import('vitest').Mock).mockReturnValue({
            isLoading: false,
            currentTenant: mockTenants[0],
            tenants: mockTenants,
            switchTenant: mockSwitchTenant
        });

        render(<StoreSelector />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        const option = screen.getByText('Loja 2');
        fireEvent.click(option);

        expect(mockSwitchTenant).toHaveBeenCalledWith('2');
    });
});
