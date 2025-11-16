import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function createRollupConfigs(argv: string[]) {
  const { build } = yargs(hideBin(argv))
    .option('build', {
      alias: 'b',
      default: 'build',
      description: 'Location of build configuration files',
      type: 'string',
    })
    .parseSync();

  writeConfigs(build);
}

function writeConfigs(build: string) {
  const root = gitRoot();
  const buildDir = join(root, build);

  if (!existsSync(buildDir)) {
    mkdirSync(buildDir);
  }

  const rollupConfigDir = join(buildDir, 'rollup');

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
