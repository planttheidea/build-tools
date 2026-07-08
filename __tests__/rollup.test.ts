import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createRollupConfig } from '../src/rollup.js';
import type { TempProject } from './__helpers__/tempProject.js';
import { createTempProject } from './__helpers__/tempProject.js';

let project: TempProject;

vi.mock('git-root', () => ({
  default: () => project.root,
}));

async function writeFixturePackageJson(root: string, overrides: Record<string, unknown> = {}) {
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({
      name: 'fixture-package',
      main: 'dist/cjs/index.js',
      module: 'dist/es/index.js',
      browser: 'dist/umd/index.js',
      dependencies: { 'left-pad': '^1.0.0' },
      ...overrides,
    }),
    'utf8',
  );
}

// `@rollup/plugin-typescript` resolves and validates its `tsconfig` path eagerly, so a
// (minimal, otherwise-unused) tsconfig needs to exist on disk for each requested format.
async function writeFixtureTsConfigs(root: string) {
  const typesDir = join(root, 'config', 'types');

  await mkdir(typesDir, { recursive: true });

  await Promise.all(
    ['es', 'cjs', 'umd'].map((format) =>
      writeFile(join(typesDir, `${format}.json`), JSON.stringify({ compilerOptions: {} }), 'utf8'),
    ),
  );
}

beforeEach(async () => {
  project = await createTempProject();

  await writeFixtureTsConfigs(project.root);
});

afterEach(async () => {
  await project.cleanup();
});

describe('createRollupConfig', () => {
  test('defaults to es and cjs formats, without umd', async () => {
    await writeFixturePackageJson(project.root);

    const config = createRollupConfig();
    const formats = config.map((entry) => !Array.isArray(entry.output) && entry.output?.format);

    // (es + cjs) build/dts pairs, plus the top-level dts config
    expect(config).toHaveLength(5);
    expect(formats).toContain('es');
    expect(formats).toContain('cjs');
    expect(formats).not.toContain('umd');
  });

  test('builds only the es format when cjs and umd are disabled', async () => {
    await writeFixturePackageJson(project.root);

    const config = createRollupConfig({ cjs: false, umd: false });

    // es build + es dts, plus the top-level dts config
    expect(config).toHaveLength(3);

    const [esBuild] = config;

    expect(esBuild).toMatchObject({ output: { format: 'es' } });
  });

  test('includes cjs and umd builds when enabled', async () => {
    await writeFixturePackageJson(project.root);

    const config = createRollupConfig({ cjs: true, umd: true });

    // (es + cjs + umd) build/dts pairs, plus the top-level dts config
    expect(config).toHaveLength(7);

    const formats = config.map((entry) => entry.output && !Array.isArray(entry.output) && entry.output.format);

    expect(formats).toContain('cjs');
    expect(formats).toContain('umd');
  });

  test('populates umd globals from external dependencies', async () => {
    await writeFixturePackageJson(project.root);

    const config = createRollupConfig({ umd: true });
    const umdBuild = config.find((entry) => !Array.isArray(entry.output) && entry.output?.format === 'umd');

    expect(umdBuild?.output).toMatchObject({
      globals: { 'left-pad': 'leftPad' },
    });
  });

  test('throws when package.json is missing the entry for a requested format', async () => {
    await writeFixturePackageJson(project.root, { main: undefined });

    expect(() => createRollupConfig({ cjs: true })).toThrow(ReferenceError);
  });
});
