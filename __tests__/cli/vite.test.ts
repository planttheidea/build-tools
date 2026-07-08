import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createViteConfig } from '../../src/cli/vite.js';
import type { TempProject } from '../__helpers__/tempProject.js';
import { createTempProject } from '../__helpers__/tempProject.js';

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

const templatesDir = join(import.meta.dirname, '..', '..', 'templates', 'vite');

describe('createViteConfig', () => {
  test('reflects the development folder in the generated config', async () => {
    await createViteConfig({ config: 'build-config', development: 'demo', react: false });

    const content = await readFile(join(project.root, 'build-config', 'vite.config.ts'), 'utf8');

    expect(content).toContain("import { createViteConfig } from '@planttheidea/build-tools';");
    expect(content).toContain("development: 'demo'");
  });

  test('creates a standard entry point when react is disabled', async () => {
    await createViteConfig({ config: 'config', development: 'dev', react: false });

    const [written, template] = await Promise.all([
      readFile(join(project.root, 'dev', 'index.ts'), 'utf8'),
      readFile(join(templatesDir, 'standard.ts'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });

  test('creates react entry points when react is enabled', async () => {
    await createViteConfig({ config: 'config', development: 'dev', react: true });

    const [writtenIndex, templateIndex, writtenApp, templateApp] = await Promise.all([
      readFile(join(project.root, 'dev', 'index.tsx'), 'utf8'),
      readFile(join(templatesDir, 'react.tsx'), 'utf8'),
      readFile(join(project.root, 'dev', 'App.tsx'), 'utf8'),
      readFile(join(templatesDir, 'App.tsx'), 'utf8'),
    ]);

    expect(writtenIndex).toBe(templateIndex);
    expect(writtenApp).toBe(templateApp);
  });

  test('always copies the index.html entry file', async () => {
    await createViteConfig({ config: 'config', development: 'dev', react: true });

    const [written, template] = await Promise.all([
      readFile(join(project.root, 'dev', 'index.html'), 'utf8'),
      readFile(join(templatesDir, 'index.html'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });
});
