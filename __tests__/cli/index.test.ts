import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createEslintConfig } from '../../src/cli/eslint.js';
import { createGitFiles } from '../../src/cli/git.js';
import { runPtiCommand } from '../../src/cli/index.js';
import { init } from '../../src/cli/init.js';
import { createPackageJson } from '../../src/cli/packageJson.js';
import { createPrettierConfig } from '../../src/cli/prettier.js';
import { createReleaseItConfigs } from '../../src/cli/releaseIt.js';
import { createRollupConfigs } from '../../src/cli/rollup.js';
import { createTsConfigs } from '../../src/cli/tsconfig.js';
import { createViteConfig } from '../../src/cli/vite.js';
import { createVitestConfig } from '../../src/cli/vitest.js';
import { createYarnFiles } from '../../src/cli/yarn.js';

vi.mock('../../src/cli/eslint.js', () => ({ createEslintConfig: vi.fn() }));
vi.mock('../../src/cli/git.js', () => ({ createGitFiles: vi.fn() }));
vi.mock('../../src/cli/init.js', () => ({ init: vi.fn() }));
vi.mock('../../src/cli/packageJson.js', () => ({ createPackageJson: vi.fn() }));
vi.mock('../../src/cli/prettier.js', () => ({ createPrettierConfig: vi.fn() }));
vi.mock('../../src/cli/releaseIt.js', () => ({ createReleaseItConfigs: vi.fn() }));
vi.mock('../../src/cli/rollup.js', () => ({ createRollupConfigs: vi.fn() }));
vi.mock('../../src/cli/tsconfig.js', () => ({ createTsConfigs: vi.fn() }));
vi.mock('../../src/cli/vite.js', () => ({ createViteConfig: vi.fn() }));
vi.mock('../../src/cli/vitest.js', () => ({ createVitestConfig: vi.fn() }));
vi.mock('../../src/cli/yarn.js', () => ({ createYarnFiles: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('runPtiCommand', () => {
  test('eslint passes every declared option through to its handler', async () => {
    await runPtiCommand(['eslint', '--config=build-config', '--development=demo', '--react', '--source=lib']);

    expect(createEslintConfig).toHaveBeenCalledWith(
      expect.objectContaining({ config: 'build-config', development: 'demo', react: true, source: 'lib' }),
    );
  });

  test('git takes no options and invokes its handler', async () => {
    await runPtiCommand(['git']);

    expect(createGitFiles).toHaveBeenCalled();
  });

  test('init passes every declared option through to its handler', async () => {
    await runPtiCommand([
      'init',
      '--no-cjs',
      '--config=build-config',
      '--development=demo',
      '--library=out',
      '--react',
      '--source=lib',
      '--sourceMap',
      '--umd',
    ]);

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        cjs: false,
        config: 'build-config',
        development: 'demo',
        library: 'out',
        react: true,
        source: 'lib',
        sourceMap: true,
        umd: true,
      }),
    );
  });

  test('package-json passes every declared option through to its handler', async () => {
    await runPtiCommand(['package-json', '--no-cjs', '--config=build-config', '--library=out', '--umd']);

    expect(createPackageJson).toHaveBeenCalledWith(
      expect.objectContaining({ cjs: false, config: 'build-config', library: 'out', umd: true }),
    );
  });

  test('prettier takes no options and invokes its handler', async () => {
    await runPtiCommand(['prettier']);

    expect(createPrettierConfig).toHaveBeenCalled();
  });

  test('release-it passes its config option through to its handler', async () => {
    await runPtiCommand(['release-it', '--config=build-config']);

    expect(createReleaseItConfigs).toHaveBeenCalledWith(expect.objectContaining({ config: 'build-config' }));
  });

  test('rollup passes every declared option through to its handler', async () => {
    await runPtiCommand(['rollup', '--no-cjs', '--config=build-config', '--source=lib', '--sourceMap', '--umd']);

    expect(createRollupConfigs).toHaveBeenCalledWith(
      expect.objectContaining({ cjs: false, config: 'build-config', source: 'lib', sourceMap: true, umd: true }),
    );
  });

  test('tsconfig passes every declared option through to its handler', async () => {
    await runPtiCommand([
      'tsconfig',
      '--no-cjs',
      '--config=build-config',
      '--development=demo',
      '--library=out',
      '--react',
      '--source=lib',
      '--sourceMap',
      '--umd',
    ]);

    expect(createTsConfigs).toHaveBeenCalledWith(
      expect.objectContaining({
        cjs: false,
        config: 'build-config',
        development: 'demo',
        library: 'out',
        react: true,
        source: 'lib',
        sourceMap: true,
        umd: true,
      }),
    );
  });

  test('vite passes every declared option through to its handler', async () => {
    await runPtiCommand(['vite', '--config=build-config', '--development=demo']);

    expect(createViteConfig).toHaveBeenCalledWith(
      expect.objectContaining({ config: 'build-config', development: 'demo' }),
    );
  });

  test('vitest passes every declared option through to its handler', async () => {
    await runPtiCommand(['vitest', '--config=build-config', '--react', '--source=lib']);

    expect(createVitestConfig).toHaveBeenCalledWith(
      expect.objectContaining({ config: 'build-config', react: true, source: 'lib' }),
    );
  });

  test('yarn takes no options and invokes its handler', async () => {
    await runPtiCommand(['yarn']);

    expect(createYarnFiles).toHaveBeenCalled();
  });
});
