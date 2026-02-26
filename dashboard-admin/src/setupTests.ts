import '@testing-library/jest-dom';

// ═══════════════════════════════════════════════════════════
// Global Browser Mocks — Required for JSDOM environment
// ═══════════════════════════════════════════════════════════

// IntersectionObserver (used by lazy loading, infinite scroll)
const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
    takeRecords: vi.fn().mockReturnValue([]),
    root: null,
    rootMargin: '',
    thresholds: [],
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// matchMedia (used by responsive hooks)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// scrollTo (used by navigation)
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// ResizeObserver (used by dynamic layouts)
const ResizeObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
