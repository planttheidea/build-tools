import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface RollupArgs {
  config: string;
}

export function createRollupConfigs({ config }: RollupArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }

  const rollupConfigDir = join(configDir, 'rollup');

  if (!existsSync(rollupConfigDir)) {
    mkdirSync(rollupConfigDir);
  }

  const scriptDirectory = import.meta.dirname;
  const templateDirectory = join(scriptDirectory, '..', '..', 'templates');

  copyFileSync(
    join(templateDirectory, 'rollup', 'cjs.config.js'),
    join(rollupConfigDir, 'cjs.config.js'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, 'rollup', 'es.config.js'),
    join(rollupConfigDir, 'es.config.js'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, 'rollup', 'umd.config.js'),
    join(rollupConfigDir, 'umd.config.js'),
    constants.COPYFILE_FICLONE,
  );
}
