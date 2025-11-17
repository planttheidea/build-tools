import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface VitestArgs {
  config: string;
  react: boolean;
  source: string;
}

export function createVitestConfig({ config, react, source }: VitestArgs) {
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
