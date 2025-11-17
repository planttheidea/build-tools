import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';

export function createViteConfig(argv: string[]) {
  const { config, react, source } = yargs(argv)
    .option('config', {
      alias: 'b',
      default: 'config',
      description: 'Location of configuration files',
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
import { createVitestConfig } from '@planttheidea/build-tools';

export default createVitestConfig({
    react: ${react.toString()},
    source: '${source}'
});
`.trim();

  writeFileSync(join(configDir, 'eslint.config.js'), content, 'utf8');
}
