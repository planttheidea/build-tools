import { join } from 'node:path';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import type { StandardConfigOptions } from './internalTypes.js';
import { DEFAULT_DEVELOPMENT_FOLDER } from './utils/constants.js';
import { gitRoot } from './utils/gitRoot.js';

interface ViteConfigOptions extends Partial<Pick<StandardConfigOptions, 'development'>> {
  overrides?: UserConfig;
}

export function createViteConfig({ development = DEFAULT_DEVELOPMENT_FOLDER, overrides }: ViteConfigOptions = {}) {
  const developmentDir = join(gitRoot(), development);

  return defineConfig({
    ...overrides,
    root: developmentDir,
    server: {
      port: 3000,
      ...overrides?.server,
    },
  });
}
