import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { init } from '../../src/cli/init.js';
import type { TempProject } from '../__helpers__/tempProject.js';
import { createTempProject, writeFixturePackageJson } from '../__helpers__/tempProject.js';

let project: TempProject;

vi.mock('git-root', () => ({
  default: () => project.root,
}));

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

beforeEach(async () => {
  project = await createTempProject();

  await writeFixturePackageJson(project.root, { scripts: {}, devDependencies: {} });
});

afterEach(async () => {
  await project.cleanup();
});

async function readGeneratedFile(...segments: string[]) {
  return readFile(join(project.root, ...segments), 'utf8');
}

describe('init', () => {
  test('threads the requested options through to every generated config, not just the defaults', async () => {
    await init({
      cjs: false,
      config: 'build-config',
      development: 'demo',
      library: 'out',
      react: true,
      source: 'lib',
      sourceMap: true,
      umd: true,
    });

    const [rollupConfig, viteConfig, vitestConfig, eslintConfig] = await Promise.all([
      readGeneratedFile('build-config', 'rollup.config.js'),
      readGeneratedFile('build-config', 'vite.config.ts'),
      readGeneratedFile('build-config', 'vitest.config.ts'),
      readGeneratedFile('build-config', 'eslint.config.js'),
    ]);

    expect(rollupConfig).toContain('cjs: false');
    expect(rollupConfig).toContain("config: 'build-config'");
    expect(rollupConfig).toContain("source: 'lib'");
    expect(rollupConfig).toContain('sourceMap: true');
    expect(rollupConfig).toContain('umd: true');

    expect(viteConfig).toContain("development: 'demo'");

    expect(vitestConfig).toContain('react: true');
    expect(vitestConfig).toContain("source: 'lib'");

    expect(eslintConfig).toContain("config: 'build-config'");
    expect(eslintConfig).toContain("development: 'demo'");
    expect(eslintConfig).toContain('react: true');
    expect(eslintConfig).toContain("source: 'lib'");
  });

  test('only creates the tsconfig build targets for the enabled formats', async () => {
    await init({
      cjs: false,
      config: 'build-config',
      development: 'demo',
      library: 'out',
      react: false,
      source: 'lib',
      sourceMap: false,
      umd: true,
    });

    expect(existsSync(join(project.root, 'build-config', 'types', 'es.json'))).toBe(true);
    expect(existsSync(join(project.root, 'build-config', 'types', 'umd.json'))).toBe(true);
    expect(existsSync(join(project.root, 'build-config', 'types', 'cjs.json'))).toBe(false);
  });

  test('creates the react dev entry points when react is enabled', async () => {
    await init({
      cjs: true,
      config: 'config',
      development: 'dev',
      library: 'dist',
      react: true,
      source: 'src',
      sourceMap: false,
      umd: false,
    });

    expect(existsSync(join(project.root, 'dev', 'index.tsx'))).toBe(true);
    expect(existsSync(join(project.root, 'dev', 'App.tsx'))).toBe(true);
  });

  test('scaffolds the standard project-level files', async () => {
    await init({
      cjs: true,
      config: 'config',
      development: 'dev',
      library: 'dist',
      react: false,
      source: 'src',
      sourceMap: false,
      umd: false,
    });

    for (const file of ['.gitignore', 'LICENSE', '.yarnrc.yml', '.prettierrc', '.prettierignore', 'tsconfig.json']) {
      expect(existsSync(join(project.root, file))).toBe(true);
    }

    for (const file of ['config/release-it/alpha.json', 'config/release-it/stable.json']) {
      expect(existsSync(join(project.root, file))).toBe(true);
    }
  });

  test('creates the source and test placeholder files on a fresh project', async () => {
    await init({
      cjs: true,
      config: 'config',
      development: 'dev',
      library: 'dist',
      react: false,
      source: 'src',
      sourceMap: false,
      umd: false,
    });

    const [sourcePlaceholder, testsPlaceholder] = await Promise.all([
      readGeneratedFile('src', 'index.ts'),
      readGeneratedFile('__tests__', 'index.test.ts'),
    ]);

    expect(sourcePlaceholder).toContain('REPLACE_ME');
    expect(testsPlaceholder).toContain("test('placeholder'");
  });
});
