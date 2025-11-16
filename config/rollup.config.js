import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import typescript from '@rollup/plugin-typescript';
import fastGlob from 'fast-glob';
import tsc from 'typescript';
import pkgJson from '../package.json' with { type: 'json' };

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

const { globSync } = fastGlob;

const external = [
  ...Object.keys(pkgJson.dependencies || {}),
  ...Object.keys(pkgJson.peerDependencies || {}),
  /node:/,
  'yargs/helpers',
];
const input = Object.fromEntries(
  globSync('src/**/*.ts').map((file) => [
    relative('src', file.slice(0, file.length - extname(file).length)),
    file,
  ]),
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
