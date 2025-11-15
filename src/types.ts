import { readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import type { CompilerOptions } from 'typescript';
import {
  ModuleDetectionKind,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';

interface ConfigOptions {
  compilerOptions: Omit<CompilerOptions, 'outDir'> & {
    outDir: Required<CompilerOptions>['outDir'];
  };
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

export function createDeclarationConfig<const Options extends ConfigOptions>(
  file: string,
  options: Options = {} as Options,
): MergeDeclarationOptions<Options> {
  return {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: normalizeCompilerOptions({
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
      declaration: true,
      declarationDir:
        options.compilerOptions.declarationDir ??
        join(options.compilerOptions.outDir, file, 'types'),
      emitDeclarationOnly: true,
      outDir: undefined,
    }),
  };
}

export function createStandardConfig<const Options extends ConfigOptions>(
  options: Options = {} as Options,
): MergeOptions<Options> {
  return {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: normalizeCompilerOptions({
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
    }),
  };
}

export function renameModuleExtensions(type: 'cjs' | 'es', library = 'dist') {
  const extension =
    type === 'cjs' ? '.d.cts' : type === 'es' ? '.d.mts' : undefined;

  if (!extension) {
    throw new ReferenceError(
      `Type "${type}" is invalid; please pass either "cjs" or "es".`,
    );
  }

  const typesDir = join(gitRoot(), library, type, 'types');
  const files = readdirSync(typesDir, 'utf8');

  files.forEach((file) => {
    const filePath = join(typesDir, file);
    const content = readFileSync(filePath, 'utf8');
    const updatedContent = content
      .replaceAll('.ts', extension)
      .replaceAll('.js', extension)
      .replaceAll('import {', 'import type {');

    writeFileSync(filePath, updatedContent, 'utf8');

    renameSync(filePath, filePath.replace('.d.ts', extension));
  });
}

export function writeConfig<const Options extends ConfigOptions>(
  folder: string,
  file: string,
  options: Options,
) {
  if (file.endsWith('.json')) {
    throw new ReferenceError(
      'Found extra `.json` suffix; please provoide only the base name.',
    );
  }

  const runtimeConfig = createStandardConfig(options);
  const declarationConfig = createDeclarationConfig(file, options);

  writeFileSync(
    join(folder, `${file}.json`),
    JSON.stringify(runtimeConfig, null, 2),
    'utf8',
  );
  writeFileSync(
    join(folder, `${file}.declaration.json`),
    JSON.stringify(declarationConfig, null, 2),
    'utf8',
  );

  return { declaration: declarationConfig, runtime: runtimeConfig };
}

export function writeConfigs<
  const OptionsMap extends Record<string, ConfigOptions>,
>(
  folder: string,
  optionsMap: OptionsMap,
): {
  [Key in keyof OptionsMap]: Configs<OptionsMap[Key]>;
} {
  return Object.fromEntries(
    Object.entries(optionsMap).map(([file, options]) => [
      file,
      writeConfig(folder, file, options),
    ]),
  ) as any;
}
