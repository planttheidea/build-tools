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
  DEFAULT_CONFIG_FOLDER,
  DEFAULT_DEVELOPMENT_FOLDER,
  DEFAULT_SOURCE_FOLDER,
  TEST_FOLDER,
} from './utils/constants.js';

interface Options {
  config?: string;
  development?: string;
  configs?: Config[] | ConfigWithExtends[];
  react?: boolean;
  source?: string;
}

export function createEslintConfig(
  {
    config = DEFAULT_CONFIG_FOLDER,
    configs = [],
    development = DEFAULT_DEVELOPMENT_FOLDER,
    react,
    source = DEFAULT_SOURCE_FOLDER,
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
      // Ignore everything in all directories except those we want to lint
      `**/!(${source}|${TEST_FOLDER}|${development}|${config})/**/*`,
      // Ignore all directories except those we want to lint
      `**/!(${source}|${TEST_FOLDER}|${development}|${config})`,
      // Don't ignore anything in these directories
      `!${source}/**/*`,
      `!${TEST_FOLDER}/**/*`,
      `!${development}/**/*`,
      `!${config}/**/*`,
    ]),
    eslint.configs.recommended,
    eslintImport.flatConfigs.recommended,
    {
      rules: {
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
      files: [`${config}/**/*.js`],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: [
        `${TEST_FOLDER}/**/*.ts`,
        `${TEST_FOLDER}/**/*.tsx`,
        `${config}/**/*.ts`,
        `${config}/**/*.tsx`,
        `${development}/**/*.ts`,
        `${development}/**/*.tsx`,
        `${source}/**/*.ts`,
        `${source}/**/*.tsx`,
      ],
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
        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

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
      files: [`${config}/**/*.ts`],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    ...optionalConfigs,
    ...configs,
  ]);
}
