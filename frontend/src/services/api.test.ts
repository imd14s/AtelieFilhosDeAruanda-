/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';

describe('API Axios Instance', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should set base URL', () => {
        expect(api.defaults.baseURL).toBeDefined();
    });

    it('should attach token from localStorage to interceptor', async () => {
        localStorage.setItem('auth_token', 'mock-token');

        // Cast api.interceptors.request to access the handlers array
        const requestInterceptors = (api.interceptors.request as any).handlers;
        const reqInterceptor = requestInterceptors[0].fulfilled;

        const config = { headers: {} };
        const result = await reqInterceptor(config);

        expect(result.headers.Authorization).toBe('Bearer mock-token');
    });

    it('should ignore token if not in localStorage', async () => {
        const requestInterceptors = (api.interceptors.request as any).handlers;
        const reqInterceptor = requestInterceptors[0].fulfilled;

        const config = { headers: {} };
        const result = await reqInterceptor(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle 401 response interceptor and clear data', async () => {
        const responseInterceptors = (api.interceptors.response as any).handlers;
        const errorInterceptor = responseInterceptors[0].rejected;

        const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

        const mockError = {
            response: { status: 401 },
            config: { url: '/api/protected' }
        };

        localStorage.setItem('auth_token', 'token');
        localStorage.setItem('user', '{}');

        await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    });

    it('should not clear data on 401 if it is a login request', async () => {
        const responseInterceptors = (api.interceptors.response as any).handlers;
        const errorInterceptor = responseInterceptors[0].rejected;

        const mockError = {
            response: { status: 401 },
            config: { url: '/auth/login' }
        };

        localStorage.setItem('auth_token', 'token');

        await expect(errorInterceptor(mockError)).rejects.toEqual(mockError);

        expect(localStorage.getItem('auth_token')).toBe('token');
    });
});
