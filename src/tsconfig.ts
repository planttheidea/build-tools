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
    emitDeclarationOnly: false,
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

type MergeOptions<
  BaseOptions extends ConfigOptions,
  Options extends ConfigOptions,
> = BaseOptions &
  Options & {
    compilerOptions: BaseOptions['compilerOptions'] &
      Options['compilerOptions'];
  };

type MergeDeclarationOptions<
  BaseOptions extends ConfigOptions,
  Options extends ConfigOptions,
> = BaseOptions &
  Options & {
    compilerOptions: BaseOptions['compilerOptions'] &
      Options['compilerOptions'] & {
        declaration: true;
        emitDeclarationOnly: true;
      };
  };

export function createConfigs<const Options extends ConfigOptions>(
  options: Options = {} as Options,
): {
  declaration: MergeDeclarationOptions<typeof BASE_CONFIG, Options>;
  runtime: MergeOptions<typeof BASE_CONFIG, Options>;
} {
  const runtime = {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: {
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
    },
  } as const;
  const declaration = {
    ...runtime,
    compilerOptions: {
      ...runtime.compilerOptions,
      declaration: true,
      emitDeclarationOnly: true,
    },
  } as const;

  return { declaration, runtime };
}

export function writeConfigs<const Options extends ConfigOptions>(
  file: string,
  options?: Options,
) {
  if (file.endsWith('.json')) {
    throw new ReferenceError(
      'Found extra `.json` suffix; please provoide only the base name.',
    );
  }

  const config = createConfigs(options);

  writeFileSync(
    `${file}.json`,
    JSON.stringify(config.runtime, null, 2),
    'utf8',
  );
  writeFileSync(
    `${file}.declaration.json`,
    JSON.stringify(config.declaration, null, 2),
    'utf8',
  );
}
