import eslint from '@eslint/js';
// eslint-disable-next-line import/no-unresolved
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintImport from 'eslint-plugin-import';
import gitRoot from 'git-root';
// eslint-disable-next-line import/no-unresolved
import typescriptEslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/!(src|config|templates)/**/*', // Ignore everything in all directories except those we want to lint
    '**/!(src|config|templates)', // Ignore all directories except those we want to lint
    '!src/**/*', // Don't ignore anything in source directory
    '!config/**/*', // Don't ignore anything in config directory
    '!templates/**/*', // Don't ignore anything in config directory
  ]),
  eslint.configs.recommended,
  eslintImport.flatConfigs.recommended,
  {
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/enforce-node-protocol-usage': ['error', 'always'],
      'import/export': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-commonjs': 'error',
      'import/no-default-export': 'error',
      'import/no-empty-named-blocks': 'error',
      'import/no-self-import': 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc',
          },
          'newlines-between': 'never',
        },
      ],
    },
  },
  {
    files: ['config/**/*.js', 'templates/**/*.js'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['templates/**/*.js'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['config/**/*.ts', 'src/**/*.ts', 'templates/**/*.ts'],
    extends: [typescriptEslint.configs.strictTypeChecked, typescriptEslint.configs.stylisticTypeChecked],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: gitRoot(),
      },
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Disabling since TS handles them
      'import/default': 'off',
      'import/extensions': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',

      // Disabling for performance
      'import/no-cycle': 'off',
      'import/no-named-as-default': 'off',

      // Disabling for common use-cases
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['config/**/*.ts', 'templates/**/*.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
]);
