import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
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

type MergeOptions<Options extends ConfigOptions> = Omit<
  typeof BASE_CONFIG,
  keyof Options
> &
  Omit<Options, 'compilerOptions'> & {
    compilerOptions: Omit<
      ConfigOptions['compilerOptions'],
      keyof Options['compilerOptions']
    > &
      Options['compilerOptions'];
  };

type MergeDeclarationOptions<Options extends ConfigOptions> = MergeOptions<
  Omit<Options, 'compilerOptions'> & {
    compilerOptions: Options['compilerOptions'] & {
      declaration: true;
      emitDeclarationOnly: true;
    };
  }
>;

interface Configs<Options extends ConfigOptions> {
  declaration: MergeDeclarationOptions<Options>;
  runtime: MergeOptions<Options>;
}

const BASE_CONFIG = {
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
  exclude: ['**/node_modules/**'],
} as const;

function normalizeCompilerOptions<Options extends Record<string, any>>(
  options: Options,
): Options {
  const normalizedOptions: Record<string, any> = {};

  for (const name in options) {
    if (!Object.hasOwn(options, name)) {
      continue;
    }

    const value = options[name] as any;

    if (typeof value !== 'number') {
      normalizedOptions[name] = value;
      continue;
    }

    switch (name) {
      case 'module':
        normalizedOptions[name] = ModuleKind[value];
        break;

      case 'moduleDetection':
        normalizedOptions[name] = ModuleDetectionKind[value]?.toLowerCase();
        break;

      case 'moduleResolution':
        normalizedOptions[name] = ModuleResolutionKind[value];
        break;

      case 'target':
        normalizedOptions[name] = ScriptTarget[value];
        break;

      default:
        normalizedOptions[name] = value;
        break;
    }
  }

  return normalizedOptions as Options;
}

export function createConfigs<const Options extends ConfigOptions>(
  options: Options = {} as Options,
): Configs<Options> {
  const runtime = {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: normalizeCompilerOptions({
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
    }),
  } as MergeOptions<Options>;
  const declaration = {
    ...runtime,
    compilerOptions: {
      ...runtime.compilerOptions,
      declaration: true,
      emitDeclarationOnly: true,
    },
  } as MergeDeclarationOptions<Options>;

  return { declaration, runtime };
}

export function writeConfigs<
  const _Options extends ConfigOptions,
  const ConfigMap extends Record<string, ConfigOptions>,
>(
  folder: string,
  configs: ConfigMap,
): {
  [Key in keyof ConfigMap]: Configs<ConfigMap[Key]>;
};
export function writeConfigs<const Options extends ConfigOptions>(
  folder: string,
  file: string,
  options?: Options,
): Configs<Options>;
export function writeConfigs<
  const Options extends ConfigOptions,
  const ConfigMap extends Record<string, ConfigOptions>,
>(folder: string, fileOrConfigs: string | ConfigMap, options?: Options) {
  if (typeof fileOrConfigs === 'object') {
    return Object.fromEntries(
      Object.entries(fileOrConfigs).map(([file, config]) => [
        file,
        writeConfigs(folder, file, config),
      ]),
    );
  }

  const file = fileOrConfigs;

  if (file.endsWith('.json')) {
    throw new ReferenceError(
      'Found extra `.json` suffix; please provoide only the base name.',
    );
  }

  const config = createConfigs(options);

  writeFileSync(
    join(folder, `${file}.json`),
    JSON.stringify(config.runtime, null, 2),
    'utf8',
  );
  writeFileSync(
    join(folder, `${file}.declaration.json`),
    JSON.stringify(config.declaration, null, 2),
    'utf8',
  );

  return config;
}
