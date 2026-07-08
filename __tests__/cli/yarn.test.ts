import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createYarnFiles } from '../../src/cli/yarn.js';
import type { TempProject } from '../__helpers__/tempProject.js';
import { createTempProject } from '../__helpers__/tempProject.js';

let project: TempProject;

vi.mock('git-root', () => ({
  default: () => project.root,
}));

beforeEach(async () => {
  project = await createTempProject();
});

afterEach(async () => {
  await project.cleanup();
});

describe('createYarnFiles', () => {
  test('copies the .yarnrc.yml template to the project root', async () => {
    await createYarnFiles({});

    const templateDir = join(import.meta.dirname, '..', '..', 'templates', 'yarn');
    const [written, template] = await Promise.all([
      readFile(join(project.root, '.yarnrc.yml'), 'utf8'),
      readFile(join(templateDir, '.yarnrc.yml'), 'utf8'),
    ]);

    expect(written).toBe(template);
  });
});
