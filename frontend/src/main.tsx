import { Buffer } from 'buffer'
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
window.Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastProvider } from "./context/ToastContext";
import './index.css'
import App from './App'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AppTree = () => (
  <HelmetProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </HelmetProvider>
);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppTree />
      </GoogleOAuthProvider>
    ) : (
      <AppTree />
    )}
  </StrictMode>,
)
