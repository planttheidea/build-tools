import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ModuleKind } from 'typescript';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createTsConfigs } from '../../src/cli/tsconfig.js';
import type { TempProject } from '../__helpers__/tempProject.js';
import { createTempProject } from '../__helpers__/tempProject.js';

let project: TempProject;

vi.mock('../../src/utils/gitRoot.js', () => ({
  gitRoot: () => project.root,
}));

beforeEach(async () => {
  project = await createTempProject();
});

afterEach(async () => {
  await project.cleanup();
});

async function readJson(...segments: string[]) {
  const content = await readFile(join(project.root, ...segments), 'utf8');

  return JSON.parse(content) as Record<string, any>;
}

const BASE_ARGS = {
  cjs: false,
  config: 'config',
  development: 'dev',
  library: 'dist',
  react: false,
  source: 'src',
  sourceMap: false,
  umd: false,
};

describe('createTsConfigs', () => {
  test('creates a placeholder source file when the source folder does not exist', async () => {
    await createTsConfigs(BASE_ARGS);

    const content = await readFile(join(project.root, 'src', 'index.ts'), 'utf8');

    expect(content).toContain('REPLACE_ME');
  });

  test('does not overwrite an existing source folder', async () => {
    await mkdir(join(project.root, 'src'), { recursive: true });
    await writeFile(join(project.root, 'src', 'index.ts'), '// keep me\n', 'utf8');

    await createTsConfigs(BASE_ARGS);

    const content = await readFile(join(project.root, 'src', 'index.ts'), 'utf8');

    expect(content).toBe('// keep me\n');
  });

  test('only creates the es build config by default', async () => {
    await createTsConfigs(BASE_ARGS);

    expect(existsSync(join(project.root, 'config', 'types', 'es.json'))).toBe(true);
    expect(existsSync(join(project.root, 'config', 'types', 'cjs.json'))).toBe(false);
    expect(existsSync(join(project.root, 'config', 'types', 'umd.json'))).toBe(false);
  });

  test('creates cjs and umd build configs when enabled', async () => {
    await createTsConfigs({ ...BASE_ARGS, cjs: true, umd: true });

    expect(existsSync(join(project.root, 'config', 'types', 'cjs.json'))).toBe(true);
    expect(existsSync(join(project.root, 'config', 'types', 'umd.json'))).toBe(true);
  });

  test('adds source map options to each build config when enabled', async () => {
    await createTsConfigs({ ...BASE_ARGS, sourceMap: true });

    const es = await readJson('config', 'types', 'es.json');

    expect(es.compilerOptions.sourceMap).toBe(true);
    expect(es.compilerOptions.inlineSources).toBe(true);
  });

  test('omits source map options from build configs when disabled', async () => {
    await createTsConfigs(BASE_ARGS);

    const es = await readJson('config', 'types', 'es.json');

    expect(es.compilerOptions.sourceMap).toBe(false);
    expect(es.compilerOptions.inlineSources).toBeUndefined();
  });

  test('configures react jsx and include patterns when react is enabled', async () => {
    await createTsConfigs({ ...BASE_ARGS, react: true });

    const es = await readJson('config', 'types', 'es.json');

    expect(es.compilerOptions.jsx).toBe('react-jsx');
    expect(es.compilerOptions.types).toContain('react');
    expect(es.include).toEqual(expect.arrayContaining([expect.stringContaining('.tsx')]));
  });

  test('reflects the requested module target per format', async () => {
    await createTsConfigs({ ...BASE_ARGS, cjs: true, umd: true });

    const [es, cjs, umd] = await Promise.all([
      readJson('config', 'types', 'es.json'),
      readJson('config', 'types', 'cjs.json'),
      readJson('config', 'types', 'umd.json'),
    ]);

    expect(es.compilerOptions.module).toBe(ModuleKind[ModuleKind.NodeNext]);
    expect(cjs.compilerOptions.module).toBe(ModuleKind[ModuleKind.Node16]);
    expect(umd.compilerOptions.module).toBe(ModuleKind[ModuleKind.ESNext]);
  });

  test('writes the root tsconfig.json with the resolved include patterns', async () => {
    await createTsConfigs({ ...BASE_ARGS, config: 'build-config', development: 'demo', source: 'lib' });

    const rootConfig = await readJson('tsconfig.json');

    expect(rootConfig.include).toEqual(
      expect.arrayContaining([
        expect.stringContaining('build-config'),
        expect.stringContaining('demo'),
        expect.stringContaining('lib'),
      ]),
    );
  });
});
