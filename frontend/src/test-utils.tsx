import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { ToastProvider } from './context/ToastContext';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
// Mock AuthContext if needed or import real one if logic is simple
// For now, we'll wrap with basic providers

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <GoogleOAuthProvider clientId="test-client-id">
            <HelmetProvider>
                <BrowserRouter>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </BrowserRouter>
            </HelmetProvider>
        </GoogleOAuthProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
