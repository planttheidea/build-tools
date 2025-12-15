import { dirname, join, resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import camelCase from 'camelcase';
import gitRoot from 'git-root';
import type { Plugin, RollupOptions, TreeshakingOptions } from 'rollup/dist/rollup.d.ts';
import del from 'rollup-plugin-delete';
import { dts } from 'rollup-plugin-dts';
import tsc from 'typescript';
import type { StandardConfigOptions } from './internalTypes.js';
import { DEFAULT_CONFIG_FOLDER, DEFAULT_SOURCE_FOLDER } from './utils/constants.js';
import { getPackageJson } from './utils/packageJson.js';

interface RollupConfigOptions extends Partial<
  Pick<StandardConfigOptions, 'cjs' | 'config' | 'source' | 'sourceMap' | 'umd'>
> {
  inputFile?: string;
  plugins?: Plugin[];
  treeshake?: TreeshakingOptions;
}

const POSSIBLE_OUTPUT_FORMATS = [
  { attribute: 'module', format: 'es', typesExtension: 'mts' },
  { attribute: 'main', format: 'cjs', typesExtension: 'cts' },
  { attribute: 'browser', format: 'umd', typesExtension: 'ts' },
] as const;

export function createRollupConfig({
  cjs = true,
  config = DEFAULT_CONFIG_FOLDER,
  inputFile = 'index.ts',
  plugins = [],
  source = DEFAULT_SOURCE_FOLDER,
  sourceMap = false,
  treeshake = { preset: 'smallest' },
  umd = false,
}: RollupConfigOptions = {}) {
  const configTypesDir = join(config, 'types');
  const packageJson = getPackageJson();
  const input = join(source, inputFile);

  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    /node:/,
  ];

  const supportedFormats = { cjs, es: true, umd };
  const root = gitRoot();

  const output = POSSIBLE_OUTPUT_FORMATS.reduce<RollupOptions[]>((formats, { attribute, format, typesExtension }) => {
    if (!supportedFormats[format]) {
      return formats;
    }

    const file = packageJson[attribute];

    if (!file) {
      throw new ReferenceError(
        `The file for format ${format} was not found; expected entry to exist in the "${attribute}" field in package.json.`,
      );
    }

    const globals =
      format === 'umd'
        ? external.reduce<Record<string, string> | undefined>((globals, name) => {
            if (typeof name === 'string') {
              globals ??= {};
              globals[name] = camelCase(name);
            }

            return globals;
          }, undefined)
        : undefined;

    const outputDir = dirname(file);
    const typesDir = join(root, outputDir, 'types');

    formats.push(
      {
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
        treeshake,
      },
      {
        input: resolve(typesDir, 'index.d.ts'),
        output: [{ file: resolve(root, outputDir, `index.d.${typesExtension}`), format }],
        plugins: [
          dts({ tsconfig: resolve(root, configTypesDir, `${format}.json`) }),
          del({ hook: 'buildEnd', targets: [typesDir] }),
        ],
      },
    );

    return formats;
  }, []);

  const esLibraryDir = dirname(packageJson.module);

  return [
    ...output,
    {
      input: resolve(root, esLibraryDir, 'index.d.mts'),
      output: [{ file: resolve(root, 'index.d.ts'), format: 'es' }],
      plugins: [
        dts({
          tsconfig: resolve(root, configTypesDir, `es.json`),
        }),
      ],
    },
  ];
}
