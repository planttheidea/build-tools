import { join, relative } from 'node:path';
import gitRoot from 'git-root';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig } from 'vitest/config';

interface Options {
  overrides?: ViteUserConfig;
  react?: boolean;
  source?: string;
}

export function createVitestConfig(
  { overrides, react, source = 'src' }: Options = {} as Options,
) {
  const relativeSourcePath = relative(
    import.meta.filename,
    join(gitRoot(), source),
  );

  const sourceFiles = react
    ? [`${relativeSourcePath}/**/*.ts`]
    : [`${relativeSourcePath}/**/*.ts`];
  const testFiles = react
    ? ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx']
    : ['**/__tests__/**/*.test.ts'];

  return defineConfig({
    ...overrides,
    test: {
      exclude: ['**/__helpers__/**', '**/node_modules/**'],
      include: testFiles,
      ...overrides?.test,
      coverage: {
        exclude: ['**/__helpers__/**'],
        include: sourceFiles,
        // @ts-expect-error - Narrow types down validate the full set.
        provider: 'v8',
        ...overrides?.test?.coverage,
      },
    },
  });
}
