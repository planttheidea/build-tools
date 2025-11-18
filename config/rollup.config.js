/*eslint-disable import/default, import/namespace, import/no-named-as-default, import/no-named-as-default-member */

import { readFileSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import fastGlob from 'fast-glob';
import gitRoot from 'git-root';
import tsc from 'typescript';

export const ROOT = gitRoot();

const { globSync } = fastGlob;
const packageJson = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));

const external = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  /node:/,
  /eslint\//,
  /vitest\//,
  /yargs\//,
];
const input = Object.fromEntries(
  globSync('src/**/*.ts').map((file) => [relative('src', file.slice(0, file.length - extname(file).length)), file]),
);

export default {
  external,
  input,
  output: {
    dir: 'dist',
    exports: 'named',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: resolve(ROOT, 'tsconfig.json'),
      typescript: tsc,
    }),
  ],
};
