import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createPrettierConfig } from '../../src/cli/prettier.js';
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

const templateDir = join(import.meta.dirname, '..', '..', 'templates', 'prettier');

describe('createPrettierConfig', () => {
  test('copies the .prettierignore template to the project root', async () => {
    await createPrettierConfig({});

    const [written, template] = await Promise.all([
      readFile(join(project.root, '.prettierignore'), 'utf8'),
      readFile(join(templateDir, '.prettierignore'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });

  test('copies the .prettierrc template to the project root', async () => {
    await createPrettierConfig({});

    const [written, template] = await Promise.all([
      readFile(join(project.root, '.prettierrc'), 'utf8'),
      readFile(join(templateDir, '.prettierrc'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });
});
