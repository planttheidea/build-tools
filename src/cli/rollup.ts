import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function createRollupConfigs(argv: string[]) {
  const { config } = yargs(hideBin(argv))
    .option('config', {
      alias: 'b',
      default: 'config',
      description: 'Location of configuration files',
      type: 'string',
    })
    .parseSync();

  writeConfigs(config);
}

function writeConfigs(config: string) {
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
