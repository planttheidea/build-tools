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

const BUILD_FORMATS = ['cjs', 'es', 'umd'] as const;
const RELEASE_FORMATS = ['alpha', 'beta', 'rc', 'stable'] as const;

export async function createPackageJson(args: PackageJsonArgs) {
  const root = gitRoot();
  const targetPackageJson = getPackageJson(root);

  const updatedTargetPackageJson = sortObject({
    ...targetPackageJson,
    devDependencies: {
      ...targetPackageJson.devDependencies,
      ...getDevDependencies(args),
    },
    ...getExports(args),
    license: 'MIT',
    scripts: {
      ...targetPackageJson.scripts,
      ...getBuildCommands(args),
      ...getCleanCommands(args),
      dev: 'vite --config=config/vite.config.ts',
      format: 'prettier . --log-level=warn --write',
      'format:check': 'prettier . --log-level=warn --check',
      lint: 'eslint --max-warnings=0',
      ...getReleaseCommands(args),
      test: 'vitest run --config=config/vitest.config.ts',
      typecheck: 'tsc --noEmit',
    },
    type: 'module',
    types: './index.d.ts',
  });

  const content = await format(JSON.stringify(updatedTargetPackageJson, null, 2), 'json');

  await writeFile(join(root, 'package.json'), content, 'utf8');
  await execa`yarn install`;
}

function getBuildCommands({ config, library }: PackageJsonArgs) {
  return {
    build: 'npm run clean && npm run build:dist && npm run build:types',
    'build:dist': `NODE_ENV=production rollup -c ${config}/rollup.config.js`,
    'build:types': `pti fix-types -l ${library}`,
  };
}

function getCleanCommands({ library }: PackageJsonArgs) {
  const clean = `rm -rf ${library}`;

  return BUILD_FORMATS.reduce<Record<string, string>>(
    (commands, type) => ({ ...commands, [`clean:${type}`]: `rm -rf ${library}/${type}` }),
    { clean },
  );
}

function getDevDependencies({ react }: PackageJsonArgs) {
  const ownPackageJson = getPackageJson(resolve(import.meta.dirname, '..', '..'));
  const dependencies = ['@vitest/coverage-v8', 'eslint', 'prettier', 'rollup', 'typescript', 'vite', 'vitest'];

  if (react) {
    dependencies.push('@types/react', 'react', 'react-dom');
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

function getExports({ library }: PackageJsonArgs) {
  return {
    browser: `${library}/umd/index.js`,
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
  };
}

function getReleaseCommands({ config }: PackageJsonArgs) {
  const releaseScripts = 'npm run format:check && npm run typecheck && npm run lint && npm run test && npm run build';

  return RELEASE_FORMATS.reduce<Record<string, string>>(
    (commands, format) => ({
      ...commands,
      [`release:${format}`]: `release-it --config=${config}/release-it/${format}.json`,
    }),
    { 'release:scripts': releaseScripts },
  );
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
