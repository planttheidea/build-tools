import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface VitestArgs {
  config: string;
  react: boolean;
  source: string;
}

export async function createVitestConfig({ config, react, source }: VitestArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const sourceDir = join(root, source);

  if (!existsSync(sourceDir)) {
    await mkdir(sourceDir);
  }

  const testsDir = join(sourceDir, '__tests__');

  if (!existsSync(testsDir)) {
    await mkdir(testsDir);
  }

  const configContent = `
import { createVitestConfig } from '@planttheidea/build-tools';

export default createVitestConfig({
    react: ${react.toString()},
    source: '${source}'
});
`.trim();
  const sourceContent = `
import { expect, test } from 'vitest';

test('placeholder', () => {
  expect(true).toBe(true);
});
`.trim();

  await Promise.all([
    writeFile(join(configDir, 'vitest.config.ts'), configContent, 'utf8'),
    writeFile(join(testsDir, 'index.test.ts'), sourceContent, 'utf8'),
  ]);
}
