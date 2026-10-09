import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Count variables used in JSX (e.g. <motion.div>) as used.
      'react/jsx-uses-vars': 'error',
      // Context files export a provider plus its hook; that's fine for Fast Refresh.
      'react-refresh/only-export-components': ['error', { allowExportNames: ['useComparison', 'useTheme', 'useToast'] }],
    },
  },
  {
    // The Express backend runs in Node, not the browser.
    files: ['server/**/*.js', 'api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
