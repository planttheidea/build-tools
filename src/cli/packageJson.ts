import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function createCleanPackageJson(argv: string[]) {
  const { build, library } = yargs(hideBin(argv))
    .option('build', {
      alias: 'b',
      default: 'build',
      description: 'Location of build configuration files',
      type: 'string',
    })
    .option('library', {
      alias: 'l',
      default: 'dist',
      description: 'Location of library files',
      type: 'string',
    })
    .parseSync();

  cleanPackageJson(library, build);
}

function cleanPackageJson(library: string, build: string) {
  const root = gitRoot();
  const packageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8'),
  );

  const updatedPackageJson = sortObject({
    ...packageJson,
    browser: `${library}/umd/index.js`,
    exports: {
      '.': {
        import: {
          types: `./${library}/es/index.d.mts`,
          default: `./${build}/es/index.mjs`,
        },
        require: {
          types: `./${library}/cjs/index.d.cts`,
          default: `./${library}/cjs/index.cjs`,
        },
        default: {
          types: `./${library}/umd/index.d.ts`,
          default: `./${library}/umd/umd.js`,
        },
      },
    },
    main: `${library}/cjs/index.cjs`,
    module: `${library}/es/index.mjs`,
    scripts: {
      ...packageJson.scripts,
      ...getBuildCommands('cjs', build),
      ...getCleanCommands('cjs', library),
      ...getBuildCommands('es', build),
      ...getCleanCommands('es', library),
      ...getBuildCommands('umd', build),
      ...getCleanCommands('umd', library),
      build:
        'npm run clean && npm run build:es && npm run build:es:types && npm run build:cjs && npm run build:cjs:types && npm run build:umd && npm run build:umd:types',
      clean: `rm -rf ${library}`,
    },
    types: 'index.d.ts',
  });

  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify(updatedPackageJson, null, 2),
    'utf8',
  );
}

function getBuildCommands(type: 'cjs' | 'es' | 'umd', build: string) {
  let buildTypes = `tsc -p ${build}/types/${type}.declaration.json`;

  if (type !== 'umd') {
    buildTypes += ` && pti-module-types -t ${type}`;
  }

  return {
    [`build:${type}`]: `NODE_ENV=production rollup -c ${build}/rollup/${type}.config.js`,
    [`build:${type}:types`]: buildTypes,
  };
}

function getCleanCommands(type: 'cjs' | 'es' | 'umd', library: string) {
  return {
    [`clean:${type}`]: `rm -rf ${library}/${type}`,
  };
}

function shouldSortNestedKey(key: string): boolean {
  return key === 'scripts';
}

function sortObject<Value extends Record<string, any>>(object: Value): Value {
  const keys = Object.keys(object).sort();
  const sorted: Record<string, any> = {};

  keys.forEach((key) => {
    sorted[key] = shouldSortNestedKey(key)
      ? sortObject(object[key])
      : object[key];
  });

  return sorted as Value;
}
