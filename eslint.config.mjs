import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'build/**',
      'node_modules/**',
      'public/**',
      'src/serviceWorker.ts',
      'plop-templates/**/*.hbs',
      'next-env.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          paths: ['src'],
          moduleDirectory: ['node_modules', 'src/'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.types', '.types.tsx', '.d.ts'],
        },
      },
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'max-len': ['error', 120],
      'comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.types', '.styles'] }],
      'import/extensions': ['error', 'never', { svg: 'always', tsx: 'never', types: 'never' }],
      'import/order': [
        'error',
        {
          groups: [
            ['external', 'builtin'],
            ['parent', 'internal'],
            ['index', 'sibling'],
          ],
          'newlines-between': 'always',
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-anonymous-default-export': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': ['error', { additionalHooks: '(useMemoOne)' }],
      camelcase: 'error',
      'prefer-destructuring': 'error',
      'no-nested-ternary': 'error',
    },
  },
  {
    // shadcn/ui generated components contain long Tailwind class strings
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: { 'max-len': 'off' },
  },
);
