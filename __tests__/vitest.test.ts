import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createVitestConfig } from '../src/vitest.js';
import type { TempProject } from './__helpers__/tempProject.js';
import { createTempProject } from './__helpers__/tempProject.js';

let project: TempProject;

vi.mock('git-root', () => ({
  default: () => project.root,
}));

beforeEach(async () => {
  project = await createTempProject();
});

afterEach(async () => {
  await project.cleanup();
});

describe('createVitestConfig', () => {
  test('only includes .ts test files and source files by default', () => {
    const config = createVitestConfig();

    expect(config.test?.include).toEqual(['**/__tests__/**/*.test.ts']);
    expect(config.test?.coverage?.include).toEqual([join(project.root, 'src', '**', '*.ts')]);
  });

  test('includes .tsx test files and source files when react is enabled', () => {
    const config = createVitestConfig({ react: true });

    expect(config.test?.include).toEqual(['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx']);
    expect(config.test?.coverage?.include).toEqual([
      join(project.root, 'src', '**', '*.ts'),
      join(project.root, 'src', '**', '*.tsx'),
    ]);
  });

  test('reflects a custom source folder', () => {
    const config = createVitestConfig({ source: 'lib' });

    expect(config.test?.coverage?.include).toEqual([join(project.root, 'lib', '**', '*.ts')]);
  });

  test('excludes test helpers from both discovery and coverage', () => {
    const config = createVitestConfig();

    expect(config.test?.exclude).toContain('**/__helpers__/**');
    expect(config.test?.coverage?.exclude).toContain('**/__helpers__/**');
  });

  test('uses the v8 coverage provider', () => {
    const config = createVitestConfig();

    expect(config.test?.coverage?.provider).toBe('v8');
  });

  test('merges user overrides on top of the defaults', () => {
    const config = createVitestConfig({ overrides: { test: { globals: true } } });

    expect(config.test?.globals).toBe(true);
    expect(config.test?.include).toEqual(['**/__tests__/**/*.test.ts']);
  });
});
