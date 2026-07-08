import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createViteConfig } from '../src/vite.js';
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

describe('createViteConfig', () => {
  test('defaults the dev server root to the default development folder', () => {
    const config = createViteConfig();

    expect(config.root).toBe(join(project.root, 'dev'));
    expect(config.server).toMatchObject({ port: 3000 });
  });

  test('reflects a custom development folder', () => {
    const config = createViteConfig({ development: 'demo' });

    expect(config.root).toBe(join(project.root, 'demo'));
  });

  test('merges user overrides on top of the defaults', () => {
    const config = createViteConfig({ overrides: { server: { port: 4000 }, base: '/app/' } });

    expect(config.server).toMatchObject({ port: 4000 });
    expect(config.base).toBe('/app/');
  });
});
