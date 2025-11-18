import { constants, existsSync } from 'node:fs';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';

export interface EslintArgs {
  config: string;
  development: string;
  react: boolean;
  source: string;
}

export async function createEslintConfig({
  config,
  development,
  react,
  source,
}: EslintArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const templateDir = resolve(
    import.meta.dirname,
    '..',
    '..',
    'templates',
    'eslint',
  );

  const content = `
import { createEslintConfig } from '@planttheidea/build-tools';

export default createEslintConfig({
    config: '${config}',
    development: '${development}',
    react: ${react.toString()},
    source: '${source}'
});
`.trim();

  await Promise.all([
    writeFile(join(configDir, 'eslint.config.js'), content, 'utf8'),
    copyFile(
      join(templateDir, 'eslint.config.js'),
      join(root, 'eslint.config.js'),
      constants.COPYFILE_FICLONE,
    ),
  ]);
}
