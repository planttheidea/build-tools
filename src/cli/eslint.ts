import {
  constants,
  copyFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';

export function createEslintConfig(argv: string[]) {
  const { config, development, react, source } = yargs(argv)
    .option('config', {
      alias: 'b',
      default: 'config',
      description: 'Location of configuration files',
      type: 'string',
    })
    .option('development', {
      alias: 'd',
      default: 'dev',
      description: 'Location of development files',
      type: 'string',
    })
    .option('help', {
      alias: 'h',
      description: 'Help documentation',
      type: 'boolean',
    })
    .option('react', {
      alias: 'r',
      default: false,
      description:
        'Whether React is used, either for development or the library itself',
      type: 'boolean',
    })
    .option('source', {
      alias: 's',
      default: 'src',
      description: 'Location of source files',
      type: 'string',
    })
    .parseSync();

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
