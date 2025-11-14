import { join, resolve } from 'node:path';
import { writeConfigs } from '../src/createConfig.ts';
import { ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';

const DESTINATION_FOLDER = resolve('tsconfig');

function getDestination(file: string): string {
  return join(DESTINATION_FOLDER, file);
}

writeConfigs(getDestination('base'));
writeConfigs(getDestination('esm'), {
  compilerOptions: {
    module: ModuleKind.NodeNext,
    moduleResolution: ModuleResolutionKind.NodeNext,
  },
});
writeConfigs(getDestination('cjs'), {
  compilerOptions: {
    module: ModuleKind.Node16,
    moduleResolution: ModuleResolutionKind.Node16,
  },
});
writeConfigs(getDestination('umd'), {
  compilerOptions: {
    module: ModuleKind.ESNext,
    moduleResolution: ModuleResolutionKind.Bundler,
    target: ScriptTarget.ES2015,
  },
});
writeConfigs(getDestination('min'));
