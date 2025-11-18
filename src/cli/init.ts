import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';
import { createEslintConfig } from './eslint.js';
import { createPackageJson } from './packageJson.js';
import { createReleaseItConfigs } from './releaseIt.js';
import { createRollupConfigs } from './rollup.js';
import { createTsConfigs } from './tsconfig.js';
import { createViteConfig } from './vite.js';
import { createVitestConfig } from './vitest.js';

export interface InitArgs {
  config: string;
  development: string;
  library: string;
  react: boolean;
  source: string;
}

export async function init(args: InitArgs) {
  await Promise.all([createFileFolderStructure(args), createPackageJson(args)]);

  await createTsConfigs(args);

  await Promise.all([
    createEslintConfig(args),
    createRollupConfigs(args),
    createViteConfig(args),
    createVitestConfig(args),
    createReleaseItConfigs(args),
  ]);
}

async function createFileFolderStructure({
  config,
  development,
  source,
}: InitArgs) {
  const root = gitRoot();

  await Promise.all([
    createConfigDirs(root, config),
    createDevelopmentDirs(root, development),
    createSourceDirs(root, source),
  ]);
}

async function createConfigDirs(root: string, config: string) {
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const pendingConfigSubDirs = ['release-it', 'rollup', 'types'].map(
    async (dirName) => {
      const dir = join(configDir, dirName);

      if (!existsSync(dir)) {
        await mkdir(dir);
      }
    },
  );

  await Promise.all(pendingConfigSubDirs);
}

async function createDevelopmentDirs(root: string, development: string) {
  const developmentDir = join(root, development);

  if (!existsSync(developmentDir)) {
    await mkdir(developmentDir);
  }
}

async function createSourceDirs(root: string, source: string) {
  const sourceDir = join(root, source);

  if (!existsSync(sourceDir)) {
    await mkdir(sourceDir);
  }

  const sourceTestsDir = join(sourceDir, '__tests__');

  if (!existsSync(sourceTestsDir)) {
    await mkdir(sourceTestsDir);
  }
}
