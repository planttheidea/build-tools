import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execa } from 'execa';

export interface TempProject {
  cleanup: () => Promise<void>;
  root: string;
}

export async function createTempProject(): Promise<TempProject> {
  const root = await mkdtemp(join(tmpdir(), 'pti-build-tools-'));

  await execa('git', ['init'], { cwd: root });

  return {
    root,
    cleanup: () => rm(root, { force: true, recursive: true }),
  };
}

export async function writeFixturePackageJson(root: string, overrides: Record<string, unknown> = {}) {
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
export async function writeFixtureTsConfigs(root: string): Promise<void> {
  const typesDir = join(root, 'config', 'types');

  await mkdir(typesDir, { recursive: true });

  await Promise.all(
    ['es', 'cjs', 'umd'].map((format) =>
      writeFile(join(typesDir, `${format}.json`), JSON.stringify({ compilerOptions: {} }), 'utf8'),
    ),
  );
}
