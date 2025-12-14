import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';
import type { StandardConfigOptions } from '../internalTypes.js';

export interface RollupArgs extends Pick<StandardConfigOptions, 'config'> {}

export async function createRollupConfigs({ config }: RollupArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const scriptDirectory = import.meta.dirname;
  const templateDirectory = join(scriptDirectory, '..', '..', 'templates');

  await copyFile(
    join(templateDirectory, 'rollup', 'rollup.config.js'),
    join(configDir, 'rollup.config.js'),
    constants.COPYFILE_FICLONE,
  );
}
