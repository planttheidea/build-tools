import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createPackageJson } from '../../src/cli/packageJson.js';
import type { PackageJson } from '../../src/internalTypes.js';
import type { TempProject } from '../__helpers__/tempProject.js';
import { createTempProject } from '../__helpers__/tempProject.js';

let project: TempProject;

vi.mock('git-root', () => ({
  default: () => project.root,
}));

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

beforeEach(async () => {
  project = await createTempProject();

  await writeFixturePackageJson(project.root);
});

afterEach(async () => {
  await project.cleanup();

  vi.clearAllMocks();
});

async function writeFixturePackageJson(root: string) {
  const { writeFile } = await import('node:fs/promises');

  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ name: 'fixture-package', scripts: {}, devDependencies: {} }),
    'utf8',
  );
}

async function readPackageJson() {
  const content = await readFile(join(project.root, 'package.json'), 'utf8');

  return JSON.parse(content) as PackageJson;
}

async function readOwnDependencyVersion(name: string): Promise<string> {
  const ownPackageJsonPath = resolve(import.meta.dirname, '..', '..', 'package.json');
  const ownPackageJson = JSON.parse(await readFile(ownPackageJsonPath, 'utf8')) as Record<string, any>;

  return ownPackageJson.dependencies[name] as string;
}

describe('createPackageJson', () => {
  test('sets the standard author, license, and publish fields', async () => {
    await createPackageJson({ cjs: true, config: 'config', library: 'dist', react: false, umd: false });

    const packageJson = await readPackageJson();

    expect(packageJson.author).toMatchObject({ email: 'tony.quetano@planttheidea.com', name: 'Tony Quetano' });
    expect(packageJson.license).toBe('MIT');
    expect(packageJson.publishConfig).toEqual({ access: 'public' });
    expect(packageJson.files).toEqual(['dist', 'LICENSE', 'README.md', 'index.d.ts', 'package.json']);
  });

  test('exposes only the es and cjs exports by default', async () => {
    await createPackageJson({ cjs: true, config: 'config', library: 'dist', react: false, umd: false });

    const packageJson = await readPackageJson();

    expect(packageJson.exports['.']).toHaveProperty('import');
    expect(packageJson.exports['.']).toHaveProperty('require');
    expect(packageJson.exports['.']).not.toHaveProperty('default');
    expect(packageJson.browser).toBeUndefined();
  });

  test('adds a umd/browser export when umd is enabled', async () => {
    await createPackageJson({ cjs: true, config: 'config', library: 'dist', react: false, umd: true });

    const packageJson = await readPackageJson();

    expect(packageJson.exports['.']).toHaveProperty('default');
    expect(packageJson.browser).toBe('./dist/umd/index.js');
  });

  test('drops the cjs export when cjs is disabled', async () => {
    await createPackageJson({ cjs: false, config: 'config', library: 'dist', react: false, umd: false });

    const packageJson = await readPackageJson();

    expect(packageJson.exports['.']).not.toHaveProperty('require');
    expect(packageJson.main).toBe('./dist/es/index.mjs');
  });

  test('only adds clean commands for enabled formats', async () => {
    await createPackageJson({ cjs: false, config: 'config', library: 'dist', react: false, umd: true });

    const packageJson = await readPackageJson();

    expect(packageJson.scripts).toHaveProperty('clean:es');
    expect(packageJson.scripts).toHaveProperty('clean:umd');
    expect(packageJson.scripts).not.toHaveProperty('clean:cjs');
  });

  test('reflects the config folder in the build and release scripts', async () => {
    await createPackageJson({ cjs: true, config: 'build-config', library: 'dist', react: false, umd: false });

    const packageJson = await readPackageJson();

    expect(packageJson.scripts['build:dist']).toContain('build-config/rollup.config.js');
    expect(packageJson.scripts['release:stable']).toContain('build-config/release-it/stable.json');
  });

  test('includes react devDependencies only when react is enabled', async () => {
    await createPackageJson({ cjs: true, config: 'config', library: 'dist', react: true, umd: false });

    const packageJson = await readPackageJson();
    const expectedReactVersion = await readOwnDependencyVersion('react');

    expect(packageJson.devDependencies.react).toBe(expectedReactVersion);
    expect(packageJson.devDependencies).toHaveProperty('react-dom');
    expect(packageJson.devDependencies).toHaveProperty('@types/react');
  });

  test('does not include react devDependencies by default', async () => {
    await createPackageJson({ cjs: true, config: 'config', library: 'dist', react: false, umd: false });

    const packageJson = await readPackageJson();

    expect(packageJson.devDependencies).not.toHaveProperty('react');
  });

  test('installs dependencies via execa before formatting the final output', async () => {
    const { execa } = await import('execa');

    await createPackageJson({ cjs: true, config: 'config', library: 'dist', react: false, umd: false });

    // Our own `createTempProject` helper also calls the (shared, mocked) `execa` to run `git init`,
    // so find the call this test actually cares about rather than assuming call order/count.
    const yarnInstallCall = vi.mocked(execa).mock.calls.find((call) => Array.isArray(call[0]));
    const strings = yarnInstallCall?.[0] as string[] | undefined;

    expect(strings?.join('')).toBe('yarn install');
  });
});
