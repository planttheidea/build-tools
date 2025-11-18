import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execa } from 'execa';
import gitRoot from 'git-root';
import { format } from '../utils/format.js';
import { getPackageJson } from '../utils/packageJson.js';

export interface PackageJsonArgs {
  config: string;
  library: string;
  react: boolean;
}

export async function createPackageJson({ config, library, react }: PackageJsonArgs) {
  const root = gitRoot();
  const targetPackageJson = getPackageJson(root);

  const updatedTargetPackageJson = sortObject({
    ...targetPackageJson,
    browser: `${library}/umd/index.js`,
    devDependencies: {
      ...targetPackageJson.devDependencies,
      ...getDevDependencies({ react }),
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
      dev: 'vite --config=config/vite/vite.config.ts',
      format: 'prettier . --log-level=warn --write',
      'format:check': 'prettier . --log-level=warn --check',
      license: 'MIT',
      lint: 'eslint --max-warnings=0',
      release: `release-it --config=${config}/release-it/stable.json`,
      'release:alpha': `release-it --config=${config}/release-it/alpha.json`,
      'release:beta': `release-it --config=${config}/release-it/beta.json`,
      'release:rc': `release-it --config=${config}/release-it/rc.json`,
      'release:scripts': 'npm run format:check && npm run typecheck && npm run lint && npm run test && npm run build',
      test: 'vitest run --config=config/vitest.config.ts',
      typecheck: 'tsc --noEmit',
    },
    types: 'index.d.ts',
  });

  const content = await format(JSON.stringify(updatedTargetPackageJson, null, 2), 'json');

  await writeFile(join(root, 'package.json'), content, 'utf8');
  await execa`yarn install`;
}

function getBuildCommands(type: 'cjs' | 'es' | 'umd', config: string) {
  let buildTypes = `tsc -p ${config}/types/${type}.declaration.json`;

  if (type !== 'umd') {
    buildTypes += ` && pti fix-types -t ${type}`;
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

function getDevDependencies({ react }: Pick<PackageJsonArgs, 'react'>) {
  const ownPackageJson = getPackageJson(resolve(import.meta.dirname, '..', '..'));
  const dependencies = ['@vitest/coverage-v8', 'eslint', 'prettier', 'rollup', 'typescript', 'vite', 'vitest'];

  if (react) {
    dependencies.push('react', 'react-dom');
  }

  return dependencies.reduce<Record<string, string>>((devDependencies, name) => {
    const dependency = ownPackageJson.dependencies?.[name];

    if (!dependency) {
      throw new Error(`Dependency "${name}" is not available in build tools dependencies.`);
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = object[key];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    sorted[key] = shouldSortNestedKey(key) ? sortObject(value) : value;
  });

  return sorted as Value;
}
