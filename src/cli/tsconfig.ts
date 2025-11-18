#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';
import type { CompilerOptions } from 'typescript';
import { ModuleDetectionKind, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { TEST_FOLDER } from '../utils/constants.js';
import { format } from '../utils/format.js';

export interface TsConfigArgs {
  config: string;
  development: string;
  library: string;
  react: boolean;
  source: string;
}

export async function createTsConfigs({ config, development, library, react, source }: TsConfigArgs) {
  const root = gitRoot();
  const sourceDir = join(root, source);
  const sourceExists = existsSync(sourceDir);

  if (!sourceExists) {
    await mkdir(sourceDir);
  }

  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const configTypes = join(configDir, 'types');

  if (!existsSync(configTypes)) {
    await mkdir(configTypes);
  }

  const baseConfig = getStandardConfig({
    compilerOptions: {
      baseUrl: source,
      jsx: react ? 'react-jsx' : undefined,
      outDir: library,
      types: react ? ['node', 'react'] : ['node'],
    },
    exclude: ['**/node_modules/**', `${library}/**/*`],
    include: getInclude({ config, development, react, source, test: TEST_FOLDER }),
  });

  const files: Array<Promise<void>> = [];

  if (!sourceExists) {
    const srcContent = await format('export const REPLACE_ME = {};');

    files.push(writeFile(join(sourceDir, 'index.ts'), srcContent, 'utf8'));
  }

  const configContent = await format(JSON.stringify(baseConfig, null, 2), 'json');

  files.push(writeFile(join(root, 'tsconfig.json'), configContent, 'utf8'));

  const prefix = join('..', '..');
  const include = getInclude({ source, prefix });
  const exclude = [...BASE_CONFIG.exclude, `**/${TEST_FOLDER}/**`];

  await writeConfigs(resolve(configTypes), {
    cjs: {
      compilerOptions: {
        module: ModuleKind.Node16,
        moduleResolution: ModuleResolutionKind.Node16,
        outDir: join(prefix, library, 'cjs'),
      },
      include,
      exclude,
    },
    es: {
      compilerOptions: {
        module: ModuleKind.NodeNext,
        moduleResolution: ModuleResolutionKind.NodeNext,
        outDir: join(prefix, library, 'es'),
      },
      include,
      exclude,
    },
    umd: {
      compilerOptions: {
        module: ModuleKind.ESNext,
        moduleResolution: ModuleResolutionKind.Bundler,
        outDir: join(prefix, library, 'umd'),
      },
      include,
      exclude,
    },
  });
}

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

type MergeOptions<Options extends ConfigOptions> = Omit<typeof BASE_CONFIG, keyof Options>
  & Omit<Options, 'compilerOptions'> & {
    compilerOptions: Omit<ConfigOptions['compilerOptions'], keyof Options['compilerOptions']>
      & Options['compilerOptions'];
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
    declaration: false,
    emitDeclarationOnly: false,
    esModuleInterop: true,
    isolatedModules: true,
    lib: ['ESNext', 'DOM'],
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

interface IncludeArgs extends Pick<Partial<TsConfigArgs>, 'config' | 'development' | 'react' | 'source'> {
  prefix?: string;
  test?: string;
}

function getInclude({ config, development, react, source, prefix = '.', test }: IncludeArgs) {
  const files = [config, development, source, test].filter((file) => typeof file === 'string');

  if (!files.length) {
    return;
  }

  return files.flatMap((folder) => {
    const standard = join(prefix, folder, '**', '*.ts');

    return react ? [standard, `${standard}x`] : [standard];
  });
}

function getDeclarationConfig<const Options extends ConfigOptions>(
  options: Options = {} as Options,
): MergeDeclarationOptions<Options> {
  return {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: getNormalizedCompilerOptions({
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
      declaration: true,
      declarationDir: options.compilerOptions.declarationDir ?? options.compilerOptions.outDir,
      emitDeclarationOnly: true,
      outDir: undefined,
    }),
  };
}

function getNormalizedCompilerOptions<Options extends Record<string, any>>(options: Options): Options {
  const normalizedOptions: Record<string, any> = {};

  for (const name in options) {
    if (!Object.hasOwn(options, name)) {
      continue;
    }

    const value = options[name];

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

function getStandardConfig<const Options extends ConfigOptions>(
  options: Options = {} as Options,
): MergeOptions<Options> {
  return {
    ...BASE_CONFIG,
    ...options,
    compilerOptions: getNormalizedCompilerOptions({
      ...BASE_CONFIG.compilerOptions,
      ...options.compilerOptions,
    }),
  };
}

async function writeConfig<const Options extends ConfigOptions>(folder: string, file: string, options: Options) {
  if (file.endsWith('.json')) {
    throw new ReferenceError('Found extra `.json` suffix; please provoide only the base name.');
  }

  const runtimeConfig = getStandardConfig(options);
  const declarationConfig = getDeclarationConfig(options);

  const [runtimeContent, declarationContent] = await Promise.all([
    format(JSON.stringify(runtimeConfig, null, 2), 'json'),
    format(JSON.stringify(declarationConfig, null, 2), 'json'),
  ]);

  await Promise.all([
    writeFile(join(folder, `${file}.json`), runtimeContent, 'utf8'),
    writeFile(join(folder, `${file}.declaration.json`), declarationContent, 'utf8'),
  ]);

  return { declaration: declarationConfig, runtime: runtimeConfig };
}

async function writeConfigs<const OptionsMap extends Record<string, ConfigOptions>>(
  folder: string,
  optionsMap: OptionsMap,
): Promise<{
  [Key in keyof OptionsMap]: Configs<OptionsMap[Key]>;
}> {
  const entries = await Promise.all(
    Object.entries(optionsMap).map(async ([file, options]) => {
      const config = await writeConfig(folder, file, options);

      return [file, config] as const;
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.fromEntries(entries) as any;
}
