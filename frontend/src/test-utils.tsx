/* eslint-disable */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CategoryProvider } from './context/CategoryContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <HelmetProvider>
            <CategoryProvider>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </CategoryProvider>
        </HelmetProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
