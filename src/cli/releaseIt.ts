import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface ReleaseItArgs {
  config: string;
}

export async function createReleaseItConfigs({ config }: ReleaseItArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const releaseItConfigDir = join(configDir, 'release-it');

  if (!existsSync(releaseItConfigDir)) {
    await mkdir(releaseItConfigDir);
  }

  const scriptDirectory = import.meta.dirname;
  const templateDirectory = join(scriptDirectory, '..', '..', 'templates', 'release-it');

  await Promise.all([
    copyFile(join(templateDirectory, 'alpha.json'), join(releaseItConfigDir, 'alpha.json'), constants.COPYFILE_FICLONE),
    copyFile(join(templateDirectory, 'beta.json'), join(releaseItConfigDir, 'beta.json'), constants.COPYFILE_FICLONE),
    copyFile(join(templateDirectory, 'rc.json'), join(releaseItConfigDir, 'rc.json'), constants.COPYFILE_FICLONE),
    copyFile(
      join(templateDirectory, 'stable.json'),
      join(releaseItConfigDir, 'stable.json'),
      constants.COPYFILE_FICLONE,
    ),
  ]);
}
