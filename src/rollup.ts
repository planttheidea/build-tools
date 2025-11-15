import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import gitRoot from 'git-root';
import tsc from 'typescript';
import type { Plugin } from 'rollup/dist/rollup.d.ts';

interface Config {
  buildTypesDir?: string;
  input?: string;
  outputDir?: string;
  outputFormat?: 'cjs' | 'es' | 'umd';
  plugins?: Plugin[];
}

export function createRollupConfig({
  buildTypesDir = join('build', 'types'),
  input = join('src', 'index.ts'),
  outputFormat = 'es',
  plugins = [],
}: Config = {}) {
  const pkgJsonPath = getPathFromRoot('package.json');
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const external = [
    ...Object.keys(pkgJson.dependencies || {}),
    ...Object.keys(pkgJson.peerDependencies || {}),
    /node:/,
  ];
  const globals = external.reduce<Record<string, string> | undefined>(
    (map, name) => {
      if (typeof name === 'string') {
        if (!map) {
          map = {};
        }

        map[name] = name;
      }
      return map;
    },
    undefined,
  );

  const fileSource =
    outputFormat === 'es'
      ? 'module'
      : outputFormat === 'umd'
        ? 'browser'
        : 'main';
  const file = pkgJson[fileSource];

  if (!file) {
    throw new ReferenceError(
      `The file for format ${outputFormat} was not found; expected entry to exist in the "${fileSource}" field in package.json.`,
    );
  }

  return {
    external,
    input,
    output: {
      exports: 'named',
      file,
      format: outputFormat,
      globals,
      name: pkgJson.name,
      sourcemap: true,
    },
    plugins: [
      // @ts-expect-error - the plugin is still a CJS format in types, so it is not registering as callable.
      typescript({
        tsconfig: resolve(gitRoot(), buildTypesDir, `${outputFormat}.json`),
        typescript: tsc,
      }),
      ...plugins,
    ],
  };
}

export function getPathFromRoot(...paths: string[]) {
  const root = gitRoot();

  return join(root, ...paths);
}
