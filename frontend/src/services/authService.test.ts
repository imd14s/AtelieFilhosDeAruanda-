import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './authService';
import api from './api';
import { cartService } from './cartService';
import { User, Address, LoginResponse } from '../types';

vi.mock('./api', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}));

vi.mock('./cartService', () => ({
    cartService: {
        migrate: vi.fn()
    }
}));

describe('authService', () => {
    const mockUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CUSTOMER',
        emailVerified: true
    };

    const mockLoginResponse: LoginResponse = {
        ...mockUser,
        token: 'fake-jwt'
    };

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();

        // Mock window.location
        vi.stubGlobal('location', {
            ...window.location,
            href: ''
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should register a user', async () => {
        const userData = { name: 'New User', email: 'new@example.com', password: 'password' };
        vi.mocked(api.post).mockResolvedValue({ data: { success: true } });

        const result = await authService.register(userData);

        expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
        expect(result.success).toBe(true);
    });

    it('should verify email', async () => {
        vi.mocked(api.post).mockResolvedValue({ data: 'Verified' });

        const result = await authService.verify('test@example.com', '123456');

        expect(api.post).toHaveBeenCalledWith('/auth/verify', { email: 'test@example.com', code: '123456' });
        expect(result).toBe('Verified');
    });

    describe('login', () => {
        it('should login successfully and set session', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: mockLoginResponse });
            vi.mocked(cartService.migrate).mockResolvedValue(undefined);

            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            const result = await authService.login('test@example.com', 'password');

            expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password' });
            expect(localStorage.getItem('auth_token')).toBe('fake-jwt');
            expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
            expect(cartService.migrate).toHaveBeenCalledWith('123');
            expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
            expect(result).toEqual(mockLoginResponse);
        });

        it('should throw error on invalid login response', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: {} });

            await expect(authService.login('test@example.com', 'password'))
                .rejects.toThrow("Resposta de login inválida");
        });

        it('should throw and log error on api failure', async () => {
            const error = new Error('401 Unauthorized');
            vi.mocked(api.post).mockRejectedValue(error);
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(authService.login('test@example.com', 'password')).rejects.toThrow();
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('googleLoginWithUserInfo', () => {
        const userInfo = { email: 'g@test.com', name: 'G User', picture: 'pic.jpg', sub: 'g123' };
        const accessToken = 'g-token';

        it('should login with Google successfully', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: mockLoginResponse });

            const result = await authService.googleLoginWithUserInfo(userInfo, accessToken);

            expect(api.post).toHaveBeenCalledWith('/auth/google', {
                email: 'g@test.com',
                name: 'G User',
                picture: 'pic.jpg',
                googleId: 'g123',
                accessToken
            });
            expect(localStorage.getItem('auth_token')).toBe('fake-jwt');
            expect(result).toEqual(mockLoginResponse);
        });

        it('should throw error if response token is missing', async () => {
            vi.mocked(api.post).mockResolvedValue({ data: {} });

            await expect(authService.googleLoginWithUserInfo(userInfo, accessToken))
                .rejects.toThrow("Resposta de login Google inválida");
        });

        it('should log error on Google login failure', async () => {
            vi.mocked(api.post).mockRejectedValue(new Error('Fail'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            await expect(authService.googleLoginWithUserInfo(userInfo, accessToken)).rejects.toThrow();
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    it('should logout and redirect', () => {
        localStorage.setItem('auth_token', 'token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        authService.logout();

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
        expect(window.location.href).toBe('/');
    });

    it('should request password reset', async () => {
        vi.mocked(api.post).mockResolvedValue({ data: 'Sent' });
        const result = await authService.requestPasswordReset('test@email.com');
        expect(api.post).toHaveBeenCalledWith('/auth/password-reset', { email: 'test@email.com' });
        expect(result).toBe('Sent');
    });

    it('should reset password', async () => {
        vi.mocked(api.post).mockResolvedValue({ data: 'Success' });
        const result = await authService.resetPassword('token', 'newPass');
        expect(api.post).toHaveBeenCalledWith('/auth/password-reset/reset', { token: 'token', newPassword: 'newPass' });
        expect(result).toBe('Success');
    });

    it('should get user from localStorage', () => {
        localStorage.setItem('user', JSON.stringify({ name: 'Saved' }));
        expect(authService.getUser()).toEqual({ name: 'Saved' });

        localStorage.setItem('user', 'invalid-json');
        expect(authService.getUser()).toBeNull();
    });

    it('should check authentication status', () => {
        expect(authService.isAuthenticated()).toBe(false);
        localStorage.setItem('auth_token', 'valid');
        expect(authService.isAuthenticated()).toBe(true);
    });

    describe('address', () => {
        it('should get addresses', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: [{ id: '1' }] });
            const result = await authService.address.get('user123');
            expect(api.get).toHaveBeenCalledWith('/addresses/user/user123', expect.any(Object));
            expect(result).toHaveLength(1);

            expect(await authService.address.get('')).toEqual([]);
        });

        it('should handle get addresses error', async () => {
            vi.mocked(api.get).mockRejectedValue(new Error());
            const result = await authService.address.get('id');
            expect(result).toEqual([]);
        });

        it('should create address', async () => {
            const addr: Address = { street: 'Main', number: '1', neighborhood: 'N', city: 'C', state: 'S', zipCode: 'Z' };
            vi.mocked(api.post).mockResolvedValue({ data: addr });
            const result = await authService.address.create('u1', addr);
            expect(result).toEqual(addr);
        });

        it('should log and throw create address error', async () => {
            vi.mocked(api.post).mockRejectedValue(new Error('Fail'));
            const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
            await expect(authService.address.create('u1', {} as Address)).rejects.toThrow();
            expect(spy).toHaveBeenCalled();
        });

        it('should delete address', async () => {
            vi.mocked(api.delete).mockResolvedValue({});
            await authService.address.delete('u1', 'a1');
            expect(api.delete).toHaveBeenCalledWith('/addresses/a1/user/u1', expect.any(Object));
        });

        it('should handle delete address error', async () => {
            vi.mocked(api.delete).mockRejectedValue(new Error());
            const spy = vi.spyOn(console, 'error').mockImplementation(() => { });
            await expect(authService.address.delete('u1', 'a1')).rejects.toThrow();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('cards', () => {
        it('should get cards', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: [{}, {}] });
            const result = await authService.cards.get();
            expect(result).toHaveLength(2);
        });

        it('should return empty array on cards error', async () => {
            vi.mocked(api.get).mockRejectedValue(new Error());
            expect(await authService.cards.get()).toEqual([]);
        });

        it('should delete card', async () => {
            vi.mocked(api.delete).mockResolvedValue({});
            await authService.cards.delete('c1');
            expect(api.delete).toHaveBeenCalledWith('/customer/cards/c1', expect.any(Object));
        });

        it('should throw on delete card error', async () => {
            vi.mocked(api.delete).mockRejectedValue(new Error());
            await expect(authService.cards.delete('c1')).rejects.toThrow();
        });
    });

    describe('favorites', () => {
        it('should get favorites', async () => {
            vi.mocked(api.get).mockResolvedValue({ data: [{ product: { id: 'p1' } }] });
            const result = await authService.favorites.get('u1');
            expect(result[0].id).toBe('p1');

            expect(await authService.favorites.get('')).toEqual([]);
        });

        it('should handle get favorites error', async () => {
            vi.mocked(api.get).mockRejectedValue(new Error());
            expect(await authService.favorites.get('u1')).toEqual([]);
        });

        it('should toggle favorite (add and remove)', async () => {
            // Mock current favorites to empty
            vi.mocked(api.get).mockResolvedValueOnce({ data: [] });
            vi.mocked(api.post).mockResolvedValue({ data: {} });

            let result = await authService.favorites.toggle('u1', 'p1');
            expect(result).toBe(true);
            expect(api.post).toHaveBeenCalledWith('/favorites', { userId: 'u1', productId: 'p1' }, expect.any(Object));

            // Mock current favorites to contain p1
            vi.mocked(api.get).mockResolvedValueOnce({ data: [{ product: { id: 'p1' } }] });
            vi.mocked(api.delete).mockResolvedValue({ data: {} });

            result = await authService.favorites.toggle('u1', 'p1');
            expect(result).toBe(false);
            expect(api.delete).toHaveBeenCalledWith('/favorites', expect.objectContaining({ params: { userId: 'u1', productId: 'p1' } }));
        });

        it('should return false if toggle params are missing', async () => {
            expect(await authService.favorites.toggle('', 'p1')).toBe(false);
        });

        it('should throw toggle error', async () => {
            // Mock finding it's NOT a favorite, so it tries to POST, and POST fails
            vi.mocked(api.get).mockResolvedValue({ data: [] });
            vi.mocked(api.post).mockRejectedValue(new Error('Fail'));
            const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(authService.favorites.toggle('u1', 'p1')).rejects.toThrow();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('updateProfile', () => {
        it('should update profile and local storage', async () => {
            localStorage.setItem('user', JSON.stringify(mockUser));
            vi.mocked(api.patch).mockResolvedValue({ data: {} });
            const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

            await authService.updateProfile({ name: 'New' });

            expect(api.patch).toHaveBeenCalledWith('/users/profile', { name: 'New' }, expect.any(Object));
            expect(JSON.parse(localStorage.getItem('user')!).name).toBe('New');
            expect(dispatchSpy).toHaveBeenCalled();
        });

        it('should throw error on update profile failure', async () => {
            vi.mocked(api.patch).mockRejectedValue(new Error('Fail'));
            await expect(authService.updateProfile({})).rejects.toThrow();
        });
    });
});
