import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createGitFiles } from '../../src/cli/git.js';
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

const templateDir = join(import.meta.dirname, '..', '..', 'templates', 'git');

describe('createGitFiles', () => {
  test('copies the .gitignore template to the project root', async () => {
    await createGitFiles({});

    const [written, template] = await Promise.all([
      readFile(join(project.root, '.gitignore'), 'utf8'),
      readFile(join(templateDir, 'gitignore'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });

  test('copies the LICENSE template to the project root', async () => {
    await createGitFiles({});

    const [written, template] = await Promise.all([
      readFile(join(project.root, 'LICENSE'), 'utf8'),
      readFile(join(templateDir, 'LICENSE'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });
});
