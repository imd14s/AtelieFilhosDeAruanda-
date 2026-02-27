import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { User } from '../types';

vi.mock('../services/authService', () => ({
    authService: {
        getUser: vi.fn(),
        isAuthenticated: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
    }
}));

const TestComponent = () => {
    const { user, isAuthenticated, isLoading, login, logout } = useAuth();
    return (
        <div>
            <div data-testid="user">{user?.name || 'no-user'}</div>
            <div data-testid="auth">{isAuthenticated.toString()}</div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <button onClick={() => login('a@b.com', '123')}>Login</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with values from authService', () => {
        const mockUser: User = { id: '1', name: 'Initial', email: 'i@i.com', role: 'USER', emailVerified: true };
        vi.mocked(authService.getUser).mockReturnValue(mockUser);
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('user').textContent).toBe('Initial');
        expect(screen.getByTestId('auth').textContent).toBe('true');
    });

    it('should update state on auth-changed event', () => {
        vi.mocked(authService.getUser).mockReturnValue(null);
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('user').textContent).toBe('no-user');

        const mockUser: User = { id: '2', name: 'Logged', email: 'l@l.com', role: 'USER', emailVerified: true };

        // Simulate auth change
        act(() => {
            vi.mocked(authService.getUser).mockReturnValue(mockUser);
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            window.dispatchEvent(new Event('auth-changed'));
        });

        expect(screen.getByTestId('user').textContent).toBe('Logged');
        expect(screen.getByTestId('auth').textContent).toBe('true');
    });

    it('should call authService.login on login action', async () => {
        const mockUser: User = { id: '3', name: 'New', email: 'n@n.com', role: 'USER', emailVerified: true };
        vi.mocked(authService.login).mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            screen.getByText('Login').click();
        });

        expect(authService.login).toHaveBeenCalledWith('a@b.com', '123');
    });

    it('should call authService.logout on logout action', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Logout').click();
        });

        expect(authService.logout).toHaveBeenCalled();
    });

    it('should throw error when useAuth is used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
        consoleSpy.mockRestore();
    });
});
