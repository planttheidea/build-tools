import { join, relative } from 'node:path';
import gitRoot from 'git-root';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';

interface Options {
  development?: string;
  overrides?: UserConfig;
}

export function createViteConfig({ development = 'dev', overrides }: Options = {} as Options) {
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
