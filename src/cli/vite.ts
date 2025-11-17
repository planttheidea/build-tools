import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';

export function createViteConfig(argv: string[]) {
  const { config, development } = yargs(argv)
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
    .parseSync();

  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }

  const content = `
import { createViteConfig } from '@planttheidea/build-tools';

export default createViteConfig({
    development: '${development}',
});
`.trim();

  writeFileSync(join(configDir, 'eslint.config.js'), content, 'utf8');
}
