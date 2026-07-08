import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createRollupConfig } from '../src/rollup.js';
import type { TempProject } from './__helpers__/tempProject.js';
import { createTempProject, writeFixturePackageJson, writeFixtureTsConfigs } from './__helpers__/tempProject.js';

let project: TempProject;

vi.mock('../src/utils/gitRoot.js', () => ({
  gitRoot: () => project.root,
}));

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
