import yargs from 'yargs';
import {
  DEFAULT_CONFIG_FOLDER,
  DEFAULT_DEVELOPMENT_FOLDER,
  DEFAULT_LIBRARY_FOLDER,
  DEFAULT_SOURCE_FOLDER,
} from '../utils/constants.js';
import type { EslintArgs } from './eslint.js';
import { createEslintConfig } from './eslint.js';
import type { FixTypesArgs } from './fixTypes.js';
import { fixTypes } from './fixTypes.js';
import type { GitArgs } from './git.js';
import { createGitFiles } from './git.js';
import type { InitArgs } from './init.js';
import { init } from './init.js';
import type { PackageJsonArgs } from './packageJson.js';
import { createPackageJson } from './packageJson.js';
import type { PrettierArgs } from './prettier.js';
import { createPrettierConfig } from './prettier.js';
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
import type { YarnArgs } from './yarn.js';
import { createYarnFiles } from './yarn.js';

const CONFIG_SETUP = {
  alias: 'c',
  default: DEFAULT_CONFIG_FOLDER,
  description: 'Location of configuration files',
  type: 'string',
} as const;
const DEVELOPMENT_SETUP = {
  alias: 'd',
  default: DEFAULT_DEVELOPMENT_FOLDER,
  description: 'Location of development files',
  type: 'string',
} as const;
const LIBRARY_SETUP = {
  alias: 'l',
  default: DEFAULT_LIBRARY_FOLDER,
  description: 'Location of library files',
  type: 'string',
} as const;
const REACT_SETUP = {
  alias: 'r',
  default: false,
  description: 'Whether React is used, either for development or the library itself',
  type: 'boolean',
} as const;
const SOURCE_SETUP = {
  alias: 's',
  default: DEFAULT_SOURCE_FOLDER,
  description: 'Location of source files',
  type: 'string',
} as const;
const SOURCE_MAP_SETUP = {
  alias: 'm',
  default: false,
  description: 'Whether source maps are included with distributed files',
  type: 'boolean',
} as const;
const UMD_SETUP = {
  alias: 'u',
  default: false,
  description: 'Whether UMD builds are included with distributed files',
  type: 'boolean',
} as const;

export function runPtiCommand(argv: string[]) {
  return yargs()
    .strictCommands()
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
      (yargs) => yargs.option('library', LIBRARY_SETUP).help(),
      fixTypes,
    )
    .command<GitArgs>(
      'git',
      'Initialize the files needed for `git` infrastructure',
      (yargs) => yargs.help(),
      createGitFiles,
    )
    .command<InitArgs>(
      'init',
      'Initialize the package with the necessary build infrastructure',
      (yargs) =>
        yargs
          .option('config', CONFIG_SETUP)
          .option('development', DEVELOPMENT_SETUP)
          .option('library', LIBRARY_SETUP)
          .option('react', REACT_SETUP)
          .option('source', SOURCE_SETUP)
          .option('sourceMap', SOURCE_MAP_SETUP)
          .option('umd', UMD_SETUP)
          .help(),
      init,
    )
    .command<PackageJsonArgs>(
      'package-json',
      'Create the `package.json` file with the appropriate script references',
      (yargs) => yargs.option('config', CONFIG_SETUP).option('library', LIBRARY_SETUP).option('umd', UMD_SETUP).help(),
      createPackageJson,
    )
    .command<PrettierArgs>(
      'prettier',
      'Create the configuration for formatting with `prettier`',
      (yargs) => yargs.help(),
      createPrettierConfig,
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
      (yargs) =>
        yargs.option('config', CONFIG_SETUP).option('sourceMap', SOURCE_MAP_SETUP).option('umd', UMD_SETUP).help(),
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
          .option('sourceMap', SOURCE_MAP_SETUP)
          .option('umd', UMD_SETUP)
          .help(),
      createTsConfigs,
    )
    .command<ViteArgs>(
      'vite',
      'Create the configuration for development with `vite`',
      (yargs) => yargs.option('config', CONFIG_SETUP).option('development', DEVELOPMENT_SETUP).help(),
      createViteConfig,
    )
    .command<VitestArgs>(
      'vitest',
      'Create the configuration for unit testing with `vitest`',
      (yargs) =>
        yargs.option('config', CONFIG_SETUP).option('react', REACT_SETUP).option('source', SOURCE_SETUP).help(),
      createVitestConfig,
    )
    .command<YarnArgs>(
      'yarn',
      'Initialize the files needed for `yarn` infrastructure',
      (yargs) => yargs.help(),
      createYarnFiles,
    )
    .help()
    .parse(argv);
}
