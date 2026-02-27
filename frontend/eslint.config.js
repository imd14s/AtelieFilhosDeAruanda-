import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'coverage/**']),

  // ═══════════════════════════════════════════════════════════
  // Global Rules — All TypeScript files
  // ═══════════════════════════════════════════════════════════
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ── Type Safety ──
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // ── Code Quality ──
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Smart/Dumb Guard — Dumb Components (src/components/)
  // Components must NOT import from services or make HTTP calls.
  // ═══════════════════════════════════════════════════════════
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['axios', 'axios/*'],
            message: '🚫 Dumb components must not import HTTP clients. Use services/ via props or hooks.',
          },
          {
            group: ['../services/*', '../../services/*', '@/services/*'],
            message: '🚫 Dumb components must not call services directly. Receive data via props.',
          },
        ],
      }],
    },
  },
])
