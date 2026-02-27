import { render, screen, fireEvent } from '../../test-utils';
import { DashboardLayout } from './DashboardLayout';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as AuthContext from '../../context/AuthContext';

vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn(),
    };
});

describe('DashboardLayout Component', () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (AuthContext.useAuth as import('vitest').Mock).mockReturnValue({
            logout: mockLogout,
            user: { name: 'Admin' }
        });
    });

    it('should render main navigation items', () => {
        render(<DashboardLayout />);
        expect(screen.getAllByText('Resumo')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Financeiro').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Pedidos').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Produtos').length).toBeGreaterThan(0);
    });

    it('should expand and collapse menu items', () => {
        render(<DashboardLayout />);

        // Use getAllByText because Desktop and Mobile sidebars both render items
        expect(screen.getAllByText('Listagem')[0]).toBeVisible();

        // Click the trigger for Produtos to collapse
        const prodTrigger = screen.getAllByRole('button').find(b => b.textContent?.includes('Produtos'));
        if (prodTrigger) fireEvent.click(prodTrigger);

        // It should no longer be in the document
        expect(screen.queryByText('Listagem')).not.toBeInTheDocument();
    });

    it('should call logout function', () => {
        render(<DashboardLayout />);

        // Note: The logout button is rendered twice (mobile drawer and desktop sidebar)
        // Use regex because there's an icon inside the button
        const logoutButtons = screen.getAllByRole('button', { name: /Sair/i });
        fireEvent.click(logoutButtons[0]);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should toggle mobile sidebar', async () => {
        render(<DashboardLayout />);

        const openMenuBtn = screen.getByLabelText('Abrir menu');
        fireEvent.click(openMenuBtn);

        const closeMenuBtn = await screen.findByRole('button', { name: /Fechar menu/i });
        expect(closeMenuBtn).toBeInTheDocument();

        fireEvent.click(closeMenuBtn);
    });
});
