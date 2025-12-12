import { dirname, join, resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import camelCase from 'camelcase';
import gitRoot from 'git-root';
import type { Plugin, RollupOptions } from 'rollup/dist/rollup.d.ts';
import { dts } from 'rollup-plugin-dts';
import tsc from 'typescript';
import { DEFAULT_CONFIG_FOLDER } from './utils/constants.js';
import { getPackageJson } from './utils/packageJson.js';

interface Config {
  config?: string;
  input?: string;
  outputDir?: string;
  plugins?: Plugin[];
  sourceMap?: boolean;
  umd?: boolean;
}

const OUTPUT_FILE_FORMATS = [
  { attribute: 'module', format: 'es' },
  { attribute: 'main', format: 'cjs' },
  { attribute: 'browser', format: 'umd' },
] as const;

export function createRollupConfig({
  config = DEFAULT_CONFIG_FOLDER,
  input = join('src', 'index.ts'),
  plugins = [],
  sourceMap = false,
  umd = false,
}: Config = {}) {
  const configTypesDir = join(config, 'types');
  const packageJson = getPackageJson();

  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    /node:/,
  ];

  const output = OUTPUT_FILE_FORMATS.reduce<RollupOptions[]>((formats, { attribute, format }) => {
    if (format === 'umd' && !umd) {
      return formats;
    }

    const file = packageJson[attribute];

    if (!file) {
      throw new ReferenceError(
        `The file for format ${format} was not found; expected entry to exist in the "${attribute}" field in package.json.`,
      );
    }

    let globals: Record<string, string> | undefined;

    if (format === 'umd') {
      globals = external.reduce<Record<string, string> | undefined>((globals, name) => {
        if (typeof name === 'string') {
          globals ??= {};
          globals[name] = camelCase(name);
        }

        return globals;
      }, undefined);
    }

    formats.push({
      external,
      input,
      output: {
        exports: 'named',
        file,
        format,
        globals,
        name: packageJson.name,
        sourcemap: sourceMap,
      },
      plugins: [
        // @ts-expect-error - the plugin is still a CJS format in types, so it is not registering as callable.
        typescript({
          tsconfig: resolve(gitRoot(), configTypesDir, `${format}.json`),
          typescript: tsc,
        }),
        ...plugins,
      ],
    });

    return formats;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const esLibraryDir = dirname(packageJson.module!);

  return [
    ...output,
    {
      input: resolve(gitRoot(), esLibraryDir, 'index.d.ts'),
      output: [{ file: resolve(gitRoot(), 'index.d.ts'), format: 'es' }],
      plugins: [
        dts({
          tsconfig: resolve(gitRoot(), configTypesDir, `es.json`),
        }),
      ],
    },
  ];
}
