import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface RollupArgs {
  config: string;
}

export async function createRollupConfigs({ config }: RollupArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const rollupConfigDir = join(configDir, 'rollup');

  if (!existsSync(rollupConfigDir)) {
    await mkdir(rollupConfigDir);
  }

  const scriptDirectory = import.meta.dirname;
  const templateDirectory = join(scriptDirectory, '..', '..', 'templates');

  await Promise.all([
    copyFile(
      join(templateDirectory, 'rollup', 'cjs.config.js'),
      join(rollupConfigDir, 'cjs.config.js'),
      constants.COPYFILE_FICLONE,
    ),
    copyFile(
      join(templateDirectory, 'rollup', 'es.config.js'),
      join(rollupConfigDir, 'es.config.js'),
      constants.COPYFILE_FICLONE,
    ),
    copyFile(
      join(templateDirectory, 'rollup', 'umd.config.js'),
      join(rollupConfigDir, 'umd.config.js'),
      constants.COPYFILE_FICLONE,
    ),
  ]);
}
