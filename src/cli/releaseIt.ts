import { constants, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface ReleaseItArgs {
  config: string;
}

export function createReleaseItConfigs({ config }: ReleaseItArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }

  const releaseItConfigDir = join(configDir, 'release-it');

  if (!existsSync(releaseItConfigDir)) {
    mkdirSync(releaseItConfigDir);
  }

  const scriptDirectory = import.meta.dirname;
  const templateDirectory = join(
    scriptDirectory,
    '..',
    '..',
    'templates',
    'release-it',
  );

  copyFileSync(
    join(templateDirectory, 'alpha.json'),
    join(releaseItConfigDir, 'alpha.json'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, 'beta.json'),
    join(releaseItConfigDir, 'beta.json'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, 'rc.json'),
    join(releaseItConfigDir, 'rc.json'),
    constants.COPYFILE_FICLONE,
  );
  copyFileSync(
    join(templateDirectory, 'stable.json'),
    join(releaseItConfigDir, 'stable.json'),
    constants.COPYFILE_FICLONE,
  );
}
