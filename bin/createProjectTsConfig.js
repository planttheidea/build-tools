#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';
import { ModuleKind, ModuleResolutionKind } from 'typescript';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createConfigs, writeConfigs } from '../dist/tsconfig.js';

const ROOT = gitRoot();
const ARGS = yargs(hideBin(process.argv))
  .option('build', {
    alias: 'b',
    default: 'build',
    description: 'Location of build configuration files',
    type: 'string',
  })
  .option('development', {
    alias: 'd',
    default: 'dev',
    description: 'Location of development files',
    type: 'string',
  })
  .option('dry', {
    default: false,
    description:
      'Whether the output of the script is a dry run or should write the files',
    type: 'boolean',
  })
  .option('help', {
    alias: 'h',
    description: 'Help documentation',
    type: 'boolean',
  })
  .option('library', {
    alias: 'l',
    default: 'dist',
    description: 'Location of library files',
    type: 'string',
  })
  .option('react', {
    alias: 'r',
    default: false,
    description:
      'Whether React is used, either for development or the library itself',
    type: 'boolean',
  })
  .option('source', {
    alias: 's',
    default: 'src',
    description: 'Location of source files',
    type: 'string',
  })
  .parse();

const { build, development, dry, library, react, source } = ARGS;

function getInclude({ build, development, source, prefix = '.' }) {
  const files = [build, development, source].filter(Boolean);

  if (!files.length) {
    return;
  }

  return files.flatMap((folder) => {
    const standard = join(prefix, folder, '**', '*.ts');

    return react ? [standard, `${standard}x`] : [standard];
  });
}

const configs = createConfigs({
  compilerOptions: {
    baseUrl: source,
    jsx: react ? 'react-jsx' : undefined,
    outDir: library,
    types: react ? ['node', 'react'] : ['node'],
  },
  exclude: ['**/node_modules/**', `${library}/**/*`],
  include: getInclude({ build, development, source }),
});
const baseConfig = JSON.stringify(configs.runtime, null, 2);

if (!existsSync(source)) {
  mkdirSync(source);
}

if (!existsSync(join(source, 'index.ts'))) {
  writeFileSync(join(source, 'index.ts'), 'export REPLACE_ME = {};', 'utf8');
}

if (!existsSync(build)) {
  mkdirSync(build);
}

const buildTypes = join(build, 'types');

if (!existsSync(buildTypes)) {
  mkdirSync(buildTypes);
}

const typesPrefix = join('..', '..');
const typesConfig = {
  compilerOptions: {
    outDir: join(typesPrefix, library),
  },
  include: getInclude(typesPrefix),
};

if (!dry) {
  /** WRITE FILES **/

  writeFileSync(join(ROOT, 'tsconfig.json'), baseConfig, 'utf8');
  writeConfigs(resolve(buildTypes), {
    base: typesConfig,
    cjs: {
      ...typesConfig,
      compilerOptions: {
        ...typesConfig.compilerOptions,
        module: ModuleKind.Node16,
        moduleResolution: ModuleResolutionKind.Node16,
      },
    },
    esm: {
      ...typesConfig,
      compilerOptions: {
        module: ModuleKind.NodeNext,
        moduleResolution: ModuleResolutionKind.NodeNext,
      },
    },
    umd: {
      ...typesConfig,
      compilerOptions: {
        ...typesConfig.compilerOptions,
        module: ModuleKind.ESNext,
        moduleResolution: ModuleResolutionKind.Bundler,
      },
    },
  });
}
