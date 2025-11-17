import {
  constants,
  copyFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';

export interface EslintArgs {
  config: string;
  development: string;
  react: boolean;
  source: string;
}

export function createEslintConfig({
  config,
  development,
  react,
  source,
}: EslintArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }

  const content = `
import { createEslintConfig } from '@planttheidea/build-tools';

export default createEslintConfig({
    config: '${config}',
    development: '${development}',
    react: ${react.toString()},
    source: '${source}'
});
`.trim();

  writeFileSync(join(configDir, 'eslint.config.js'), content, 'utf8');

  const templateDir = resolve(
    import.meta.dirname,
    '..',
    '..',
    'templates',
    'eslint',
  );

  copyFileSync(
    join(templateDir, 'eslint.config.js'),
    join(root, 'eslint.config.js'),
    constants.COPYFILE_FICLONE,
  );
}
