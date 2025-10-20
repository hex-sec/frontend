// eslint.config.mjs (ESLint v9 flat config)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports
    },
    rules: {
      // enforce semicolons consistently (use TypeScript-aware rule)
      'semi': 'off',
      '@typescript-eslint/semi': ['error', 'always'],
      'no-extra-semi': 'error',
      // Estilo + limpieza
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-multi-spaces': ['error', { ignoreEOLComments: true }],
      'keyword-spacing': ['error', { before: true, after: true }],

      // 👇 Tu regla de espaciado en paréntesis
      'space-in-parens': ['error', 'always', { exceptions: ['{}', '[]', '()'] }],

      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'always'],
      'space-before-function-paren': ['error', 'always'],
      'function-paren-newline': ['error', 'multiline'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'comma-spacing': ['error', { before: false, after: true }],

      // React
      'react/react-in-jsx-scope': 'off'
    },
    settings: {
      react: { version: 'detect' }
    }
  },
  // Desactiva reglas que chocan con Prettier (sin sobreescribir tu espaciado en paréntesis)
  eslintConfigPrettier
)
