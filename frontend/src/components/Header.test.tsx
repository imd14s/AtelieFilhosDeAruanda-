 
import { render, screen, fireEvent, waitFor } from '../test-utils';
import Header from './Header';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';

vi.mock('../services/authService', () => ({
    authService: {
        getUser: vi.fn(),
        logout: vi.fn()
    }
}));

vi.mock('../services/cartService', () => ({
    cartService: {
        get: vi.fn()
    }
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        addToast: vi.fn()
    })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/' }),
    };
});

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authService.getUser as import('vitest').Mock).mockReturnValue(null);
        (cartService.get as import('vitest').Mock).mockResolvedValue([]);
    });

    it('should render brand name', async () => {
        render(<Header />);
        expect(screen.getAllByText(/Ateliê/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Filhos de Aruanda/i).length).toBeGreaterThan(0);
        // O badge deve aparecer apenas se houver itens
        const badge = screen.queryByText('3');
        expect(badge).toBeNull();
    });

    it('should render login button when user is not authenticated', async () => {
        render(<Header />);

        await waitFor(() => {
            expect(screen.getAllByText(/Entrar/i).length).toBeGreaterThan(0);
        });
    });

    it('should render user info when authenticated', async () => {
        (authService.getUser as import('vitest').Mock).mockReturnValue({ name: 'Maria Silva' });

        render(<Header />);

        await waitFor(() => {
            expect(screen.getAllByText(/Maria/i).length).toBeGreaterThan(0);
        });
    });

    it('should open mobile menu', async () => {
        render(<Header />);

        const menuBtns = screen.getAllByRole('button');
        fireEvent.click(menuBtns[0]!); // Mobile toggle

        // Wait for state update
        await waitFor(() => {
            expect(document.body.style.overflow).toBe('hidden');
        });
    });

    it('should trigger search', async () => {
        render(<Header />);

        const searchInputs = screen.getAllByRole('textbox');
        fireEvent.change(searchInputs[0]!, { target: { value: 'Banhos' } });
        fireEvent.submit(searchInputs[0]!.closest('form')!);

        expect(mockNavigate).toHaveBeenCalledWith('/search?q=Banhos');
    });

    it('should trigger logout dispatch', async () => {
        (authService.getUser as import('vitest').Mock).mockReturnValue({ name: 'Maria Silva' });
        render(<Header />);

        await waitFor(() => {
            // "Sair" is in the dropdown and in mobile menu
            const logoutBtns = screen.getAllByText(/Sair/i);
            fireEvent.click(logoutBtns[0]!);
            expect(authService.logout).toHaveBeenCalled();
        });
    });
});
