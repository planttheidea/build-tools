import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import typescript from '@rollup/plugin-typescript';
import tsc from 'typescript';
import pkgJson from '../package.json' with { type: 'json' };

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

const external = [
  ...Object.keys(pkgJson.dependencies || {}),
  ...Object.keys(pkgJson.peerDependencies || {}),
  /node:/,
];
const globals = external.reduce((globals, name) => {
  globals[name] = name;
  return globals;
}, {});

export default {
  external,
  input: {
    createConfig: 'src/createConfig.ts',
  },
  output: {
    dir: 'dist',
    exports: 'named',
    format: 'es',
    globals,
    sourcemap: true,
  },
  plugins: [
    typescript({
      tsconfig: resolve(ROOT, '_internal', 'tsconfig.json'),
      typescript: tsc,
    }),
  ],
};
