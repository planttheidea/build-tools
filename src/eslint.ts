import eslint from '@eslint/js';
import type { Config } from 'eslint/config';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintImport from 'eslint-plugin-import';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import gitRoot from 'git-root';
import typescriptEslint from 'typescript-eslint';

interface Options {
  config?: string;
  development?: string;
  configs?: Config[];
  react?: boolean;
  source?: string;
}

export function createEslintConfig(
  {
    config = 'config',
    configs = [],
    development = 'dev',
    react,
    source = 'src',
  }: Options = {} as Options,
) {
  const optionalConfigs = [];

  if (react) {
    optionalConfigs.push(
      eslintReact.configs.flat.recommended,
      eslintReact.configs.flat['jsx-runtime'],
      eslintReactHooks.configs.flat['recommended-latest'],
      {
        settings: {
          react: {
            version: 'detect',
          },
        },
      },
    );
  }

  return defineConfig([
    globalIgnores([
      `**/!(${source}|${development}|${config})/**/*`, // Ignore everything in all directories except those we want to lint
      `**/!(${source}|${development}|${config})`, // Ignore all directories except those we want to lint
      `!${source}/**/*`, // Don't ignore anything in source directory
      `!${development}/**/*`, // Don't ignore anything in development directory
      `!${config}/**/*`, // Don't ignore anything in config directory
    ]),
    eslint.configs.recommended,
    typescriptEslint.configs.strictTypeChecked,
    typescriptEslint.configs.stylisticTypeChecked,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    eslintImport.flatConfigs.recommended,
    ...optionalConfigs,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: gitRoot(),
        },
      },
      rules: {
        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        'import/enforce-node-protocol-usage': ['error', 'always'],
        'import/export': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-absolute-path': 'error',
        'import/no-commonjs': 'error',
        'import/no-cycle': 'error',
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

        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    ...configs,
  ]);
}
