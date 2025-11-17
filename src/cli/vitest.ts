import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';

export function createVitestConfig(argv: string[]) {
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

  const configContent = `
import { createVitestConfig } from '@planttheidea/build-tools';

export default createVitestConfig({
    react: ${react.toString()},
    source: '${source}'
});
`.trim();

  writeFileSync(join(configDir, 'vitest.config.ts'), configContent, 'utf8');

  const sourceDir = join(root, source);

  if (!existsSync(sourceDir)) {
    mkdirSync(sourceDir);
  }

  const testsDir = join(sourceDir, '__tests__');

  if (!existsSync(testsDir)) {
    mkdirSync(testsDir);
  }

  const sourceContent = `
import { expect, test } from 'vitest';

test('placeholder', () => {
  expect(true).toBe(true);
});
`.trim();

  writeFileSync(join(testsDir, 'index.test.ts'), sourceContent, 'utf8');
}
