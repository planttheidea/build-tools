import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';

const folderName = 'release-it';

export function createReleaseItConfigs(argv: string[]) {
  const { config } = yargs(argv)
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

  const releaseItConfigDir = join(configDir, folderName);

  if (!existsSync(releaseItConfigDir)) {
    mkdirSync(releaseItConfigDir);
  }

  const scriptDirectory = import.meta.dirname;
  const templateDirectory = join(scriptDirectory, '..', '..', 'templates');

  copyFileSync(
    join(templateDirectory, folderName, 'alpha.json'),
    join(releaseItConfigDir, 'alpha.json'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, folderName, 'beta.json'),
    join(releaseItConfigDir, 'beta.json'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, folderName, 'rc.json'),
    join(releaseItConfigDir, 'rc.json'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, folderName, 'stable.json'),
    join(releaseItConfigDir, 'stable.json'),
    constants.COPYFILE_FICLONE,
  );
}
