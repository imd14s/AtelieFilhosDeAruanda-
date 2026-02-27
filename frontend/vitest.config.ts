import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default mergeConfig(viteConfig, defineConfig({
    test: {
        root: __dirname,
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(__dirname, 'src/setupTests.ts')],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html', 'json-summary'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/**/*.spec.{ts,tsx}',
                'src/setupTests.ts',
                'src/test-utils.tsx',
            ],
            thresholds: {
                statements: 10,
                branches: 10,
                functions: 10,
                lines: 10,
            },
        },
    },
}))
