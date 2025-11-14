import { resolve } from 'node:path';
import { writeConfigs } from '../src/tsconfig.ts';
import { ModuleKind, ModuleResolutionKind } from 'typescript';

writeConfigs(resolve('tsconfig'), {
  base: { exclude: undefined },
  cjs: {
    compilerOptions: {
      module: ModuleKind.Node16,
      moduleResolution: ModuleResolutionKind.Node16,
    },
    exclude: undefined,
  },
  esm: {
    compilerOptions: {
      module: ModuleKind.NodeNext,
      moduleResolution: ModuleResolutionKind.NodeNext,
    },
    exclude: undefined,
  },
  min: { exclude: undefined },
  umd: {
    compilerOptions: {
      module: ModuleKind.ESNext,
      moduleResolution: ModuleResolutionKind.Bundler,
    },
    exclude: undefined,
  },
});
