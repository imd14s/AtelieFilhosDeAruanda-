import { render, screen, fireEvent, waitFor, api } from '../../test-utils';
import { LoginPage } from './LoginPage';
import { describe, it, expect } from 'vitest';

describe('LoginPage Component', () => {
    it('should render login form correctly', () => {
        render(<LoginPage />);
        expect(screen.getByText('Acesso Administrativo')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('should show error message on invalid credentials', async () => {
        (api.post as any).mockRejectedValueOnce({ response: { status: 401 } });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('admin@atelie.com'), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
        });
    });

    it('should call login and redirected on success', async () => {
        (api.post as any).mockResolvedValueOnce({
            data: { token: 'mock-token-123' }
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('admin@atelie.com'), { target: { value: 'admin@atelie.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                email: 'admin@atelie.com',
                password: 'password'
            });
        });
    });
});
