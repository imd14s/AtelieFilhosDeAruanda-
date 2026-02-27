/* eslint-disable */
import { render, screen, fireEvent, waitFor } from '../test-utils';
import AuthModal from './AuthModal';
import { authService } from '../services/authService';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Mock authService
vi.mock('../services/authService', () => ({
    authService: {
        login: vi.fn(),
        register: vi.fn(),
        verify: vi.fn(),
        googleLogin: vi.fn(),
    },
}));

vi.mock('@react-oauth/google', () => ({
    useGoogleLogin: vi.fn(),
    GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn(() => ({ addToast: vi.fn(), showToast: vi.fn() }))
}));

// Mock window.location.reload
const originalLocation = window.location;
beforeEach(() => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { reload: vi.fn() };
    vi.clearAllMocks();
});
afterEach(() => {
    // @ts-ignore
    window.location = originalLocation;
});

describe('AuthModal Component', () => {
    it('should not render when isOpen is false', () => {
        const handleClose = vi.fn();
        render(<AuthModal isOpen={false} onClose={handleClose} />);
        expect(screen.queryByText('Bem-vindo')).toBeNull();
    });

    it('should render login view by default', () => {
        const handleClose = vi.fn();
        render(<AuthModal isOpen={true} onClose={handleClose} />);
        expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
        expect(screen.getByText('Entrar')).toBeInTheDocument();
    });

    it('should switch to register view', () => {
        const handleClose = vi.fn();
        render(<AuthModal isOpen={true} onClose={handleClose} />);

        const registerLink = screen.getByText('Cadastre-se');
        fireEvent.click(registerLink);

        expect(screen.getByRole('heading', { name: 'Criar Conta' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nome Completo')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
    });

    it('should call login service on form submission', async () => {
        const handleClose = vi.fn();
        (authService.login as Mock).mockResolvedValue({ token: 'fake-token' });

        render(<AuthModal isOpen={true} onClose={handleClose} />);

        fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'password123' } });

        // Use getByText to avoid issues with icon inside button affecting accessible name
        const loginButton = screen.getByText('Entrar');
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('should display error message on login failure', async () => {
        const handleClose = vi.fn();
        (authService.login as Mock).mockRejectedValue(new Error('Invalid credentials'));

        render(<AuthModal isOpen={true} onClose={handleClose} />);

        fireEvent.change(screen.getByPlaceholderText('E-mail'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'wrongpass' } });

        fireEvent.click(screen.getByText('Entrar'));

        await waitFor(() => {
            expect(screen.getByText('Credenciais inválidas.')).toBeInTheDocument();
        });
    });
});
