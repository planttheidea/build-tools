import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const folderName = 'release-it';

export function createReleaseItConfigs(argv: string[]) {
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

  const releaseItConfigDir = join(buildDir, folderName);

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
