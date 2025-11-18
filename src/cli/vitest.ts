import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';
import { TEST_FOLDER } from '../utils/constants.js';
import { format } from '../utils/format.js';

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

  const testsDir = join(root, TEST_FOLDER);
  const testsExist = existsSync(testsDir);

  if (!testsExist) {
    await mkdir(testsDir);
  }

  const [configContent, testContent] = await Promise.all([
    format(`
      import { createVitestConfig } from '@planttheidea/build-tools';

      export default createVitestConfig({
          react: ${react.toString()},
          source: '${source}'
      });
    `),
    format(`
      import { expect, test } from 'vitest';

      test('placeholder', () => {
        expect(true).toBe(true);
      });
    `),
  ]);

  const files = [writeFile(join(configDir, 'vitest.config.ts'), configContent, 'utf8')];

  if (!testsExist) {
    files.push(writeFile(join(testsDir, 'index.test.ts'), testContent, 'utf8'));
  }

  await Promise.all(files);
}
