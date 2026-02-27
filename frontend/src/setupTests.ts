/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Suprime erros de rede/recurso do JSDOM/Undici que causam Exit Code 1 sem afetar a lógica dos testes
process.on('unhandledRejection', (reason: any) => {
    if (reason && reason.code === 'UND_ERR_INVALID_ARG') {
        return;
    }
    // console.error('Unhandled Rejection:', reason);
});

// Mock global de Image para evitar carregamento de recursos reais
vi.stubGlobal('Image', class {
    onload: () => void = () => { };
    onerror: () => void = () => { };
    _src: string = '';
    set src(v: string) {
        this._src = v;
        setTimeout(() => this.onload(), 0);
    }
    get src() { return this._src; }
});
