import yargs from 'yargs';
import {
  DEFAULT_CONFIG,
  DEFAULT_DEVELOPMENT,
  DEFAULT_LIBRARY,
  DEFAULT_SOURCE,
} from '../utils/defaultParams.js';
import type { EslintArgs } from './eslint.js';
import { createEslintConfig } from './eslint.js';
import type { FixTypesArgs } from './fixTypes.js';
import { fixTypes } from './fixTypes.js';
import type { PackageJsonArgs } from './packageJson.js';
import { createPackageJson } from './packageJson.js';
import type { ReleaseItArgs } from './releaseIt.js';
import { createReleaseItConfigs } from './releaseIt.js';
import type { RollupArgs } from './rollup.js';
import { createRollupConfigs } from './rollup.js';
import type { TsConfigArgs } from './tsconfig.js';
import { createTsConfigs } from './tsconfig.js';
import type { ViteArgs } from './vite.js';
import { createViteConfig } from './vite.js';
import type { VitestArgs } from './vitest.js';
import { createVitestConfig } from './vitest.js';

const CONFIG_SETUP = {
  alias: 'c',
  default: DEFAULT_CONFIG,
  description: 'Location of configuration files',
  type: 'string',
} as const;
const DEVELOPMENT_SETUP = {
  alias: 'd',
  default: DEFAULT_DEVELOPMENT,
  description: 'Location of development files',
  type: 'string',
} as const;
const LIBRARY_SETUP = {
  alias: 'l',
  default: DEFAULT_LIBRARY,
  description: 'Location of library files',
  type: 'string',
} as const;
const REACT_SETUP = {
  alias: 'r',
  default: false,
  description:
    'Whether React is used, either for development or the library itself',
  type: 'boolean',
} as const;
const SOURCE_SETUP = {
  alias: 's',
  default: DEFAULT_SOURCE,
  description: 'Location of source files',
  type: 'string',
} as const;

export function runPtiCommand(argv: string[]) {
  return yargs()
    .command<EslintArgs>(
      'eslint',
      'Create ESLint configuration',
      (yargs) =>
        yargs
          .option('config', CONFIG_SETUP)
          .option('development', DEVELOPMENT_SETUP)
          .option('react', REACT_SETUP)
          .option('source', SOURCE_SETUP)
          .help(),
      createEslintConfig,
    )
    .command<FixTypesArgs>(
      'fix-types',
      'Rename the types files to have correct extension for the module type',
      (yargs) =>
        yargs
          .option('type', {
            alias: 't',
            choices: ['cjs', 'es'] as const,
            description: 'Module types to rename',
            required: true,
            type: 'string',
          })
          .option('library', LIBRARY_SETUP)
          .help(),
      fixTypes,
    )
    .command<PackageJsonArgs>(
      'package-json',
      'Create the `package.json` file with the appropriate script references',
      (yargs) =>
        yargs
          .option('config', CONFIG_SETUP)
          .option('library', LIBRARY_SETUP)
          .help(),
      createPackageJson,
    )
    .command<ReleaseItArgs>(
      'release-it',
      'Create configuration related to the `release-it` package for publishing',
      (yargs) => yargs.option('config', CONFIG_SETUP).help(),
      createReleaseItConfigs,
    )
    .command<RollupArgs>(
      'rollup',
      'Create the rollup configuration',
      (yargs) => yargs.option('config', CONFIG_SETUP).help(),
      createRollupConfigs,
    )
    .command<TsConfigArgs>(
      'tsconfig',
      'Create the `tsconfig.json` files, both for the main application and for the building of the library',
      (yargs) =>
        yargs
          .option('config', CONFIG_SETUP)
          .option('development', DEVELOPMENT_SETUP)
          .option('library', LIBRARY_SETUP)
          .option('react', REACT_SETUP)
          .option('source', SOURCE_SETUP)
          .help(),
      createTsConfigs,
    )
    .command<ViteArgs>(
      'vite',
      'Create the configuration for development with `vite`',
      (yargs) =>
        yargs
          .option('config', CONFIG_SETUP)
          .option('development', DEVELOPMENT_SETUP)
          .help(),
      createViteConfig,
    )
    .command<VitestArgs>(
      'vitest',
      'Create the configuration for unit testing with `vitest`',
      (yargs) =>
        yargs
          .option('config', CONFIG_SETUP)
          .option('react', REACT_SETUP)
          .option('source', SOURCE_SETUP)
          .help(),
      createVitestConfig,
    )
    .help()
    .parseSync(argv);
}
