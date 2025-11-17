import { createEslintConfig } from './eslint.js';
import { createPackageJson } from './packageJson.js';
import { createReleaseItConfigs } from './releaseIt.js';
import { createRollupConfigs } from './rollup.js';
import { createTsConfigs } from './tsconfig.js';
import { createViteConfig } from './vite.js';
import { createVitestConfig } from './vitest.js';

export interface InitArgs {
  config: string;
  development: string;
  library: string;
  react: boolean;
  source: string;
}

export function init(args: InitArgs) {
  createPackageJson(args);
  createTsConfigs(args);
  createEslintConfig(args);
  createViteConfig(args);
  createVitestConfig(args);
  createRollupConfigs(args);
  createReleaseItConfigs(args);
}
