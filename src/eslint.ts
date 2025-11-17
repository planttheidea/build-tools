import type { ConfigWithExtends } from '@eslint/config-helpers';
import eslint from '@eslint/js';
import type { Config } from 'eslint/config';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintImport from 'eslint-plugin-import';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import gitRoot from 'git-root';
import typescriptEslint from 'typescript-eslint';
import {
  DEFAULT_CONFIG,
  DEFAULT_DEVELOPMENT,
  DEFAULT_SOURCE,
} from './utils/defaultParams.js';

interface Options {
  config?: string;
  development?: string;
  configs?: Config[] | ConfigWithExtends[];
  react?: boolean;
  source?: string;
}

export function createEslintConfig(
  {
    config = DEFAULT_CONFIG,
    configs = [],
    development = DEFAULT_DEVELOPMENT,
    react,
    source = DEFAULT_SOURCE,
  }: Options = {} as Options,
) {
  const optionalConfigs: ConfigWithExtends[] = [];

  if (react) {
    optionalConfigs.push({
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eslintReact.configs.flat.recommended!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        eslintReact.configs.flat['jsx-runtime']!,
        eslintReactHooks.configs.flat['recommended-latest'],
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
    });
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
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        typescriptEslint.configs.strictTypeChecked,
        typescriptEslint.configs.stylisticTypeChecked,
      ],
      languageOptions: {
        parser: typescriptEslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: gitRoot(),
        },
      },
      rules: {
        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],

        'import/no-unresolved': 'off',

        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['config/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    ...optionalConfigs,
    ...configs,
  ]);
}
