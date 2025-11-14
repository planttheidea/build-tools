import { writeFileSync } from 'node:fs';
import type { CompilerOptions } from 'typescript';
import {
  ModuleDetectionKind,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';

interface ConfigOptions {
  compilerOptions?: CompilerOptions;
  exclude?: string[];
  extends?: string;
  files?: string[];
  include?: string[];
  references?: string[];
}

const BASE_CONFIG: ConfigOptions = {
  compilerOptions: {
    allowJs: true,
    baseUrl: 'src',
    declaration: false,
    esModuleInterop: true,
    isolatedModules: true,
    lib: ['ESNext'],
    module: ModuleKind.NodeNext,
    moduleDetection: ModuleDetectionKind.Force,
    moduleResolution: ModuleResolutionKind.NodeNext,
    noFallthroughCasesInSwitch: true,
    noImplicitAny: true,
    noImplicitOverride: true,
    noUncheckedIndexedAccess: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    sourceMap: true,
    strict: true,
    strictNullChecks: true,
    inlineSources: true,
    target: ScriptTarget.ES2015,
    verbatimModuleSyntax: true,
    types: ['node'],
  },
  exclude: ['node_modules'],
};

type MergeOptions<Options extends ConfigOptions> = typeof BASE_CONFIG &
  Options & {
    compilerOptions: typeof BASE_CONFIG.compilerOptions &
      Options['compilerOptions'];
  };

export function createConfig<const Options extends ConfigOptions>(
  options: Options,
): MergeOptions<Options> {
  return {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: {
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
    },
  };
}

export function writeConfig<const Options extends ConfigOptions>(
  file: string,
  options: Options,
) {
  if (!file.endsWith('.json')) {
    throw new ReferenceError('Destination file must be JSON.');
  }

  const config = createConfig(options);

  writeFileSync(file, JSON.stringify(config), 'utf8');
}
