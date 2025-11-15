#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createConfigs } from '../dist/tsconfig.js';

const ROOT = gitRoot();
const ARGS = yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    default: 'cfg',
    description: 'Location of configuration files',
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

const { config, development, dry, library, react, source } = ARGS;

const include = [config, development, source].flatMap((folder) =>
  react ? [`${folder}/**/*.ts`, `${folder}/**/*.tsx`] : [`${folder}/**/*.ts`],
);

const configs = createConfigs({
  compilerOptions: {
    baseUrl: source,
    jsx: react ? 'react-jsx' : undefined,
    outDir: library,
    types: react ? ['node', 'react'] : ['node'],
  },
  exclude: ['**/node_modules/**', `${library}/**/*`],
  include,
});
const baseConfig = JSON.stringify(configs.runtime, null, 2);

if (dry) {
  console.log(baseConfig);
} else {
  writeFileSync(join(ROOT, 'tsconfig.json'), baseConfig, 'utf8');
}
