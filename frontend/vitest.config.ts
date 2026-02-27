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
    },
}))
