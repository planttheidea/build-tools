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

export function createRollupConfig({
  configTypesDir = join('config', 'types'),
  input = join('src', 'index.ts'),
  outputFormat = 'es',
  plugins = [],
}: Config = {}) {
  const packageJson = getPackageJson();

  const fileSource = outputFormat === 'es' ? 'module' : outputFormat === 'umd' ? 'browser' : 'main';
  const file = packageJson[fileSource];

  if (!file) {
    throw new ReferenceError(
      `The file for format ${outputFormat} was not found; expected entry to exist in the "${fileSource}" field in package.json.`,
    );
  }

  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
    /node:/,
  ];
  const globals =
    outputFormat === 'umd'
      ? external.reduce<Record<string, string> | undefined>((globals, name) => {
          if (typeof name === 'string') {
            globals ??= {};
            globals[name] = camelCase(name);
          }

          return globals;
        }, undefined)
      : undefined;

  return {
    external,
    input,
    output: {
      exports: 'named',
      file,
      format: outputFormat,
      globals,
      name: packageJson.name,
      sourcemap: true,
    },
    plugins: [
      // @ts-expect-error - the plugin is still a CJS format in types, so it is not registering as callable.
      typescript({
        tsconfig: resolve(gitRoot(), configTypesDir, `${outputFormat}.json`),
        typescript: tsc,
      }),
      ...plugins,
    ],
  };
}
