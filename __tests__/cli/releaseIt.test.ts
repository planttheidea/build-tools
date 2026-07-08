import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createReleaseItConfigs } from '../../src/cli/releaseIt.js';
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

const templateDir = join(import.meta.dirname, '..', '..', 'templates', 'release-it');

describe('createReleaseItConfigs', () => {
  test.each(['alpha', 'beta', 'rc', 'stable'])('copies the %s.json template into config/release-it', async (name) => {
    await createReleaseItConfigs({ config: 'config' });

    const [written, template] = await Promise.all([
      readFile(join(project.root, 'config', 'release-it', `${name}.json`), 'utf8'),
      readFile(join(templateDir, `${name}.json`), 'utf8'),
    ]);

    expect(written).toBe(template);
  });

  test('reflects a custom config directory', async () => {
    await createReleaseItConfigs({ config: 'build-config' });

    const written = await readFile(join(project.root, 'build-config', 'release-it', 'stable.json'), 'utf8');
    const template = await readFile(join(templateDir, 'stable.json'), 'utf8');

    expect(written).toBe(template);
  });
});
