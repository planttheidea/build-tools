import { join, resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import camelCase from 'camelcase';
import gitRoot from 'git-root';
import type { Plugin } from 'rollup/dist/rollup.d.ts';
import tsc from 'typescript';
import { getPackageJson } from './utils/packageJson.js';

interface Config {
  configTypesDir?: string;
  globals?: Record<string, string>;
  input?: string;
  outputDir?: string;
  outputFormat?: 'cjs' | 'es' | 'umd';
  plugins?: Plugin[];
}

const OUTPUT_FILE_FORMATS = [
  { attribute: 'module', format: 'es' },
  { attribute: 'main', format: 'cjs' },
  { attribute: 'browser', format: 'umd' },
] as const;

export function createRollupConfig({
  configTypesDir = join('config', 'types'),
  input = join('src', 'index.ts'),
  plugins = [],
}: Config = {}) {
  const packageJson = getPackageJson();

  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    /node:/,
  ];

  return OUTPUT_FILE_FORMATS.map(({ attribute, format }) => {
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

    return {
      external,
      input,
      output: {
        exports: 'named',
        file,
        format,
        globals,
        name: packageJson.name,
        sourcemap: true,
      },
      plugins: [
        // @ts-expect-error - the plugin is still a CJS format in types, so it is not registering as callable.
        typescript({
          tsconfig: resolve(gitRoot(), configTypesDir, `${format}.json`),
          typescript: tsc,
        }),
        ...plugins,
      ],
    };
  });
}
