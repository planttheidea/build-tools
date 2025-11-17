import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function createCleanPackageJson(argv: string[]) {
  const { config, library } = yargs(hideBin(argv))
    .option('config', {
      alias: 'b',
      default: 'config',
      description: 'Location of configuration files',
      type: 'string',
    })
    .option('library', {
      alias: 'l',
      default: 'dist',
      description: 'Location of library files',
      type: 'string',
    })
    .parseSync();

  cleanPackageJson(library, config);
}

function cleanPackageJson(library: string, config: string) {
  const root = gitRoot();
  const targetPackageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8'),
  );
  const ownPackageJson = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, '..', '..', 'package.json'),
      'utf8',
    ),
  );

  const updatedTargetPackageJson = sortObject({
    ...targetPackageJson,
    browser: `${library}/umd/index.js`,
    devDependencies: {
      ...targetPackageJson.devDependencies,
      ...getDevDependencies(),
    },
    exports: {
      '.': {
        import: {
          types: `./${library}/es/index.d.mts`,
          default: `./${library}/es/index.mjs`,
        },
        require: {
          types: `./${library}/cjs/index.d.cts`,
          default: `./${library}/cjs/index.cjs`,
        },
        default: {
          types: `./${library}/umd/index.d.ts`,
          default: `./${library}/umd/index.js`,
        },
      },
    },
    main: `${library}/cjs/index.cjs`,
    module: `${library}/es/index.mjs`,
    scripts: {
      ...targetPackageJson.scripts,
      ...getBuildCommands('cjs', config),
      ...getCleanCommands('cjs', library),
      ...getBuildCommands('es', config),
      ...getCleanCommands('es', library),
      ...getBuildCommands('umd', config),
      ...getCleanCommands('umd', library),
      build:
        'npm run clean && npm run build:es && npm run build:es:types && npm run build:cjs && npm run build:cjs:types && npm run build:umd && npm run build:umd:types',
      clean: `rm -rf ${library}`,
      lint: 'echo "TODO LINT"',
      release: `release-it --config=${config}/release-it/stable.json`,
      'release:alpha': `release-it --config=${config}/release-it/alpha.json`,
      'release:beta': `release-it --config=${config}/release-it/beta.json`,
      'release:rc': `release-it --config=${config}/release-it/rc.json`,
      'release:scripts':
        'npm run typecheck && npm run lint && npm run test && npm run build',
      test: 'echo "TODO TEST"',
      typecheck: 'tsc --noEmit',
    },
    types: 'index.d.ts',
  });

  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify(updatedTargetPackageJson, null, 2),
    'utf8',
  );
}

function getBuildCommands(type: 'cjs' | 'es' | 'umd', config: string) {
  let buildTypes = `tsc -p ${config}/types/${type}.declaration.json`;

  if (type !== 'umd') {
    buildTypes += ` && pti-module-types -t ${type}`;
  }

  return {
    [`build:${type}`]: `NODE_ENV=production rollup -c ${config}/rollup/${type}.config.js`,
    [`build:${type}:types`]: buildTypes,
  };
}

function getCleanCommands(type: 'cjs' | 'es' | 'umd', library: string) {
  return {
    [`clean:${type}`]: `rm -rf ${library}/${type}`,
  };
}

function getDevDependencies() {
  const ownPackageJson = JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, '..', '..', 'package.json'),
      'utf8',
    ),
  );

  return [
    '@vitest/coverage-v8',
    'eslint',
    'rollup',
    'typescript',
    'vite',
    'vitest',
  ].reduce<Record<string, string>>((devDependencies, name) => {
    const dependency = ownPackageJson.dependencies[name];

    if (!dependency) {
      throw new Error(
        `Dependency "${name}" is not available in build tools dependencies.`,
      );
    }

    devDependencies[name] = dependency;

    return devDependencies;
  }, {});
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
