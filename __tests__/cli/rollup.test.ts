import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createRollupConfigs } from '../../src/cli/rollup.js';
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

describe('createRollupConfigs', () => {
  test('reflects non-default options in the generated config', async () => {
    await createRollupConfigs({
      cjs: false,
      config: 'build-config',
      source: 'lib',
      sourceMap: true,
      umd: true,
    });

    const content = await readFile(join(project.root, 'build-config', 'rollup.config.js'), 'utf8');

    expect(content).toContain("import { createRollupConfig } from '@planttheidea/build-tools';");
    expect(content).toContain('cjs: false');
    expect(content).toContain("config: 'build-config'");
    expect(content).toContain("source: 'lib'");
    expect(content).toContain('sourceMap: true');
    expect(content).toContain('umd: true');
  });

  test('reflects default options in the generated config', async () => {
    await createRollupConfigs({
      cjs: true,
      config: 'config',
      source: 'src',
      sourceMap: false,
      umd: false,
    });

    const content = await readFile(join(project.root, 'config', 'rollup.config.js'), 'utf8');

    expect(content).toContain('cjs: true');
    expect(content).toContain("config: 'config'");
    expect(content).toContain("source: 'src'");
    expect(content).toContain('sourceMap: false');
    expect(content).toContain('umd: false');
  });

  test('creates the config directory when it does not exist', async () => {
    await createRollupConfigs({ cjs: true, config: 'output', source: 'src', sourceMap: false, umd: false });

    const content = await readFile(join(project.root, 'output', 'rollup.config.js'), 'utf8');

    expect(content).toContain("config: 'output'");
  });
});
