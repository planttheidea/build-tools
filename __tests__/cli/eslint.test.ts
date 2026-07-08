import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createEslintConfig } from '../../src/cli/eslint.js';
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

describe('createEslintConfig', () => {
  test('reflects the provided options in the generated config', async () => {
    await createEslintConfig({ config: 'build-config', development: 'demo', react: true, source: 'lib' });

    const content = await readFile(join(project.root, 'build-config', 'eslint.config.js'), 'utf8');

    expect(content).toContain("import { createEslintConfig } from '@planttheidea/build-tools';");
    expect(content).toContain("config: 'build-config'");
    expect(content).toContain("development: 'demo'");
    expect(content).toContain('react: true');
    expect(content).toContain("source: 'lib'");
  });

  test('copies the root eslint.config.js template', async () => {
    await createEslintConfig({ config: 'config', development: 'dev', react: false, source: 'src' });

    const templateDir = join(import.meta.dirname, '..', '..', 'templates', 'eslint');
    const [written, template] = await Promise.all([
      readFile(join(project.root, 'eslint.config.js'), 'utf8'),
      readFile(join(templateDir, 'eslint.config.js'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });
});
