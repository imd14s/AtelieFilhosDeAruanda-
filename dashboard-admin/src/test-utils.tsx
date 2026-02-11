import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { vi } from 'vitest';

// Mock API
vi.mock('./api/axios', () => ({
    api: {
        post: vi.fn(),
        get: vi.fn(),
        defaults: {
            headers: {
                common: {}
            }
        }
    }
}));

// Mock Services
vi.mock('./services/TenantService', () => ({
    TenantService: {
        getAll: vi.fn(() => Promise.resolve([])),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}));

vi.mock('./services/CategoryService', () => ({
    CategoryService: {
        getAll: vi.fn(() => Promise.resolve([])),
    }
}));

vi.mock('./services/ProductService', () => ({
    ProductService: {
        getAll: vi.fn(() => Promise.resolve([])),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    }
}));

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TenantProvider>
                    {children}
                </TenantProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export mocked API
import { api } from './api/axios';
const mockedApi = vi.mocked(api, true);

export * from '@testing-library/react';
export { customRender as render };
export { mockedApi as api };
