import { join, relative } from 'node:path';
import gitRoot from 'git-root';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig } from 'vitest/config';
import { DEFAULT_SOURCE_FOLDER, TEST_FOLDER, TEST_HELPERS_FOLDER } from './utils/constants.js';

interface Options {
  overrides?: ViteUserConfig;
  react?: boolean;
  source?: string;
}

export function createVitestConfig({ overrides, react, source = DEFAULT_SOURCE_FOLDER }: Options = {} as Options) {
  const relativeSourcePath = relative(import.meta.filename, join(gitRoot(), source));
  const sourceFiles = react ? [`${relativeSourcePath}/**/*.ts`] : [`${relativeSourcePath}/**/*.ts`];

  const testPattern = `**/${TEST_FOLDER}/**/*.test.ts`;
  const testHelpersPattern = `**/${TEST_HELPERS_FOLDER}/**`;
  const testFiles = react ? [testPattern, `${testPattern}x`] : [testPattern];

  return defineConfig({
    ...overrides,
    test: {
      exclude: [testHelpersPattern, '**/node_modules/**'],
      include: testFiles,
      ...overrides?.test,
      coverage: {
        exclude: [testHelpersPattern],
        include: sourceFiles,
        // @ts-expect-error - Narrow types down validate the full set.
        provider: 'v8',
        ...overrides?.test?.coverage,
      },
    },
  });
}
