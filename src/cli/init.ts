import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execa } from 'execa';
import gitRoot from 'git-root';
import { TEST_FOLDER } from '../utils/constants.js';
import { createEslintConfig } from './eslint.js';
import { createGitFiles } from './git.js';
import { createPackageJson } from './packageJson.js';
import { createPrettierConfig } from './prettier.js';
import { createReleaseItConfigs } from './releaseIt.js';
import { createRollupConfigs } from './rollup.js';
import { createTsConfigs } from './tsconfig.js';
import { createViteConfig } from './vite.js';
import { createVitestConfig } from './vitest.js';
import { createYarnFiles } from './yarn.js';

export interface InitArgs {
  config: string;
  development: string;
  library: string;
  react: boolean;
  source: string;
}

export async function init(args: InitArgs) {
  await Promise.all([createGitFiles(args), createYarnFiles(args), createFileFolderStructure(args)]);

  await createPrettierConfig(args);
  await createPackageJson(args);
  await createTsConfigs(args);

  await Promise.all([
    createEslintConfig(args),
    createRollupConfigs(args),
    createViteConfig(args),
    createVitestConfig(args),
    createReleaseItConfigs(args),
  ]);

  await execa`npm run format`;
}

async function createFileFolderStructure({ config, development, source }: InitArgs) {
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

  const pendingConfigSubDirs = ['release-it', 'types'].map(async (dirName) => {
    const dir = join(configDir, dirName);

    if (!existsSync(dir)) {
      await mkdir(dir);
    }
  });

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

  const testsDir = join(root, TEST_FOLDER);

  if (!existsSync(testsDir)) {
    await mkdir(testsDir);
  }
}
