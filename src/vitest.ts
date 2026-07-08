import { join } from 'node:path';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig } from 'vitest/config';
import type { StandardConfigOptions } from './internalTypes.js';
import { DEFAULT_SOURCE_FOLDER, TEST_FOLDER, TEST_HELPERS_FOLDER } from './utils/constants.js';
import { gitRoot } from './utils/gitRoot.js';

interface VitestConfigOptions extends Partial<Pick<StandardConfigOptions, 'react' | 'source'>> {
  overrides?: ViteUserConfig;
}

export function createVitestConfig({ overrides, react, source = DEFAULT_SOURCE_FOLDER }: VitestConfigOptions = {}) {
  const sourcePath = join(gitRoot(), source);
  const sourceFiles = react ? [`${sourcePath}/**/*.ts`, `${sourcePath}/**/*.tsx`] : [`${sourcePath}/**/*.ts`];

  const testPattern = `**/${TEST_FOLDER}/**/*.test.ts`;
  const testFiles = react ? [testPattern, `${testPattern}x`] : [testPattern];

  const testHelpersPattern = `**/${TEST_HELPERS_FOLDER}/**`;

  return defineConfig({
    ...overrides,
    test: {
      exclude: [testHelpersPattern, '**/node_modules/**'],
      include: testFiles,
      ...overrides?.test,
      coverage: {
        exclude: [testHelpersPattern],
        include: sourceFiles,
        provider: 'v8',
        ...overrides?.test?.coverage,
      },
    },
  });
}
