import { Buffer } from 'buffer'
if (typeof global === 'undefined') {
  window.global = window;
}
window.Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AppTree = () => (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

createRoot(document.getElementById('root')).render(
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
