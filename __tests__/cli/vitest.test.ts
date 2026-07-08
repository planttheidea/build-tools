import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createVitestConfig } from '../../src/cli/vitest.js';
import type { TempProject } from '../__helpers__/tempProject.js';
import { createTempProject } from '../__helpers__/tempProject.js';

let project: TempProject;

vi.mock('../../src/utils/gitRoot.js', () => ({
  gitRoot: () => project.root,
}));

beforeEach(async () => {
  project = await createTempProject();
});

afterEach(async () => {
  await project.cleanup();
});

describe('createVitestConfig', () => {
  test('reflects the provided options in the generated config', async () => {
    await createVitestConfig({ config: 'build-config', react: true, source: 'lib' });

    const content = await readFile(join(project.root, 'build-config', 'vitest.config.ts'), 'utf8');

    expect(content).toContain("import { createVitestConfig } from '@planttheidea/build-tools';");
    expect(content).toContain('react: true');
    expect(content).toContain("source: 'lib'");
  });

  test('creates a placeholder test file when __tests__ does not exist', async () => {
    await createVitestConfig({ config: 'config', react: false, source: 'src' });

    const content = await readFile(join(project.root, '__tests__', 'index.test.ts'), 'utf8');

    expect(content).toContain("test('placeholder'");
  });

  test('does not overwrite existing tests when __tests__ already exists', async () => {
    const testsDir = join(project.root, '__tests__');

    await mkdir(testsDir);
    await writeFile(join(testsDir, 'existing.test.ts'), '// existing test\n', 'utf8');

    await createVitestConfig({ config: 'config', react: false, source: 'src' });

    expect(existsSync(join(testsDir, 'index.test.ts'))).toBe(false);

    const existingContent = await readFile(join(testsDir, 'existing.test.ts'), 'utf8');

    expect(existingContent).toBe('// existing test\n');
  });
});
