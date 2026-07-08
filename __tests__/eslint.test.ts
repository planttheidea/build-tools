import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createEslintConfig } from '../src/eslint.js';
import type { TempProject } from './__helpers__/tempProject.js';
import { createTempProject } from './__helpers__/tempProject.js';

let project: TempProject;

vi.mock('../src/utils/gitRoot.js', () => ({
  gitRoot: () => project.root,
}));

beforeEach(async () => {
  project = await createTempProject();
});

afterEach(async () => {
  await project.cleanup();
});

function getGlobalIgnores(config: ReturnType<typeof createEslintConfig>) {
  return config.find((entry): entry is { ignores: string[] } => 'ignores' in entry);
}

describe('createEslintConfig', () => {
  test('ignores everything outside the default source/test/development/config folders', () => {
    const config = createEslintConfig();
    const globalIgnores = getGlobalIgnores(config);

    expect(globalIgnores?.ignores).toEqual(
      expect.arrayContaining([
        expect.stringContaining('src'),
        expect.stringContaining('__tests__'),
        expect.stringContaining('dev'),
        expect.stringContaining('config'),
      ]),
    );
  });

  test('reflects custom folder names in the ignore patterns', () => {
    const config = createEslintConfig({ config: 'build-config', development: 'demo', source: 'lib' });
    const globalIgnores = getGlobalIgnores(config);

    expect(globalIgnores?.ignores).toEqual(
      expect.arrayContaining([
        expect.stringContaining('lib'),
        expect.stringContaining('demo'),
        expect.stringContaining('build-config'),
      ]),
    );
  });

  test('does not add react-specific config by default', () => {
    const config = createEslintConfig();
    const reactConfig = config.find((entry) => 'settings' in entry && !!entry.settings?.react);

    expect(reactConfig).toBeUndefined();
  });

  test('adds react-specific config when react is enabled', () => {
    const config = createEslintConfig({ react: true });
    const reactConfig = config.find((entry) => 'settings' in entry && !!entry.settings?.react);

    expect(reactConfig?.settings?.react).toMatchObject({ version: 'detect' });
  });

  test('appends any additional configs passed in', () => {
    const marker = { files: ['marker.ts'], rules: { 'no-console': 'error' as const } };
    const config = createEslintConfig({ configs: [marker] });

    expect(config).toContainEqual(marker);
  });
});
