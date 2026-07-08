/* eslint-disable @typescript-eslint/no-unsafe-call */
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execa } from 'execa';
import gitRoot from 'git-root';
import type { StandardConfigOptions } from '../internalTypes.js';
import { format } from '../utils/format.js';
import { getPackageJson } from '../utils/packageJson.js';

export interface PackageJsonArgs extends Pick<StandardConfigOptions, 'cjs' | 'config' | 'library' | 'react' | 'umd'> {}

const BUILD_FORMATS = ['cjs', 'es', 'umd'] as const;
const RELEASE_FORMATS = ['alpha', 'beta', 'rc', 'stable'] as const;

export async function createPackageJson(args: PackageJsonArgs) {
  const root = gitRoot();
  const targetPackageJson = getPackageJson(root);

  const updatedTargetPackageJson = sortObject({
    ...targetPackageJson,
    author: {
      email: 'tony.quetano@planttheidea.com',
      name: 'Tony Quetano',
      url: 'https://www.planttheidea.com/',
    },
    devDependencies: {
      ...targetPackageJson.devDependencies,
      ...getDevDependencies(args),
    },
    ...getExportsConfig(args),
    files: [args.library, 'LICENSE', 'README.md', 'index.d.ts', 'package.json'],
    license: 'MIT',
    publishConfig: {
      access: 'public',
    },
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
    sideEffects: false,
    type: 'module',
    types: './index.d.ts',
  });

  const rawContent = JSON.stringify(updatedTargetPackageJson, null, 2);

  // Write the raw content and run install to allow prettier to be installed prior to formatting.
  await writeFile(join(root, 'package.json'), rawContent, 'utf8');
  await execa`yarn install`;

  // After installation, format the package.json file.
  const content = await format(rawContent, 'json');
  await writeFile(join(root, 'package.json'), content, 'utf8');
}

function getBuildCommands({ config }: PackageJsonArgs) {
  return {
    build: 'npm run clean && npm run build:dist',
    'build:dist': `NODE_ENV=production rollup -c ${config}/rollup.config.js`,
  };
}

function getCleanCommands({ cjs, library, umd }: PackageJsonArgs) {
  const clean = `rm -rf ${library}`;
  const supportedFormats = { cjs, es: true, umd };

  return BUILD_FORMATS.reduce<Record<string, string>>(
    (commands, type) =>
      supportedFormats[type] ? { ...commands, [`clean:${type}`]: `rm -rf ${library}/${type}` } : commands,
    { clean },
  );
}

function getDevDependencies({ react }: PackageJsonArgs) {
  const ownPackageJson = getPackageJson(resolve(import.meta.dirname, '..', '..'));
  const dependencies = [
    '@vitest/coverage-v8',
    'eslint',
    'prettier',
    'release-it',
    'rollup',
    'typescript',
    'vite',
    'vitest',
  ];

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

function getExportsConfig({ cjs, library, umd }: PackageJsonArgs) {
  const esDefinition = { types: `./${library}/es/index.d.mts`, default: `./${library}/es/index.mjs` };
  const cjsDefinition = cjs ? { types: `./${library}/cjs/index.d.cts`, default: `./${library}/cjs/index.cjs` } : null;
  const umdDefinition = umd ? { types: `./${library}/umd/index.d.ts`, default: `./${library}/umd/index.js` } : null;

  if (cjsDefinition && umdDefinition) {
    // - ES drives `import` and `module` (modern use-case)
    // - CJS drives `require` (CJS-specific) and `main` (assume legacy Node version)
    // - UMD drives `default` (ultimate fallback for legacy module systems) and `browser` (allow for globals)
    return {
      browser: umdDefinition.default,
      exports: {
        '.': {
          import: esDefinition,
          require: cjsDefinition,
          default: umdDefinition,
        },
      },
      main: cjsDefinition.default,
      module: esDefinition.default,
    };
  }

  if (cjsDefinition) {
    // - ES drives `import` and `module` (modern use-case)
    // - CJS drives `require` (CJS-specific) and `main` (assume legacy Node version)
    // - Assumes no other module systems are used
    return {
      exports: {
        '.': {
          import: esDefinition,
          require: cjsDefinition,
        },
      },
      main: cjsDefinition.default,
      module: esDefinition.default,
    };
  }

  // - ES drives `import` and `module` (modern use-case)
  // - UMD drives `default` (ultimate fallback for legacy module systems), `browser` (allow for globals), and `main` (allow for CJS usage)
  if (umdDefinition) {
    return {
      browser: umdDefinition.default,
      exports: {
        '.': {
          import: esDefinition,
          default: umdDefinition,
        },
      },
      main: umdDefinition.default,
      module: esDefinition.default,
    };
  }

  // - ES drives `import` and `module` (modern use-case)
  // - Assumes no legacy module systems are used
  return {
    exports: {
      '.': {
        import: esDefinition,
      },
    },
    main: esDefinition.default,
  };
}

function getReleaseCommands({ config }: PackageJsonArgs) {
  const releaseItConfig = JSON.parse(
    readFileSync(resolve(import.meta.dirname, '..', '..', 'templates', 'release-it', 'stable.json'), 'utf8'),
  ) as Record<string, any>;
  const releaseScripts = releaseItConfig.hooks['before:init'].join(' && ') as string;

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
