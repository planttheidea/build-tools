#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
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

interface Args {
  build?: string;
  development?: string;
  dry?: boolean;
  library?: string;
  react?: boolean;
  source?: string;
}

interface IncludeArgs
  extends Pick<Args, 'build' | 'development' | 'react' | 'source'> {
  prefix?: string;
}

function getInclude({
  build,
  development,
  react,
  source,
  prefix = '.',
}: IncludeArgs) {
  const files = [build, development, source].filter(
    (file) => typeof file === 'string',
  );

  if (!files.length) {
    return;
  }

  return files.flatMap((folder) => {
    const standard = join(prefix, folder, '**', '*.ts');

    return react ? [standard, `${standard}x`] : [standard];
  });
}

export function createProjectTsConfigs(argv: string[]) {
  const { build, development, dry, library, react, source } = yargs(
    hideBin(argv),
  )
    .option('build', {
      alias: 'b',
      default: 'build',
      description: 'Location of build configuration files',
      type: 'string',
    })
    .option('development', {
      alias: 'd',
      default: 'dev',
      description: 'Location of development files',
      type: 'string',
    })
    .option('dry', {
      default: false,
      description:
        'Whether the output of the script is a dry run or should write the files',
      type: 'boolean',
    })
    .option('help', {
      alias: 'h',
      description: 'Help documentation',
      type: 'boolean',
    })
    .option('library', {
      alias: 'l',
      default: 'dist',
      description: 'Location of library files',
      type: 'string',
    })
    .option('react', {
      alias: 'r',
      default: false,
      description:
        'Whether React is used, either for development or the library itself',
      type: 'boolean',
    })
    .option('source', {
      alias: 's',
      default: 'src',
      description: 'Location of source files',
      type: 'string',
    })
    .parseSync();

  if (!existsSync(source)) {
    mkdirSync(source);
  }

  if (!existsSync(join(source, 'index.ts'))) {
    writeFileSync(
      join(source, 'index.ts'),
      'export const REPLACE_ME = {};',
      'utf8',
    );
  }

  if (!existsSync(build)) {
    mkdirSync(build);
  }

  const buildTypes = join(build, 'types');

  if (!existsSync(buildTypes)) {
    mkdirSync(buildTypes);
  }

  if (!dry) {
    /** WRITE FILES **/

    const root = gitRoot();

    const baseConfig = createStandardConfig({
      compilerOptions: {
        baseUrl: source,
        jsx: react ? 'react-jsx' : undefined,
        outDir: library,
        types: react ? ['node', 'react'] : ['node'],
      },
      exclude: ['**/node_modules/**', `${library}/**/*`],
      include: getInclude({ build, development, source }),
    });

    writeFileSync(
      join(root, 'tsconfig.json'),
      JSON.stringify(baseConfig, null, 2),
      'utf8',
    );

    const prefix = join('..', '..');
    const include = getInclude({ source, prefix });

    writeConfigs(resolve(buildTypes), {
      cjs: {
        compilerOptions: {
          module: ModuleKind.Node16,
          moduleResolution: ModuleResolutionKind.Node16,
          outDir: join(prefix, library),
        },
        include,
      },
      es: {
        compilerOptions: {
          module: ModuleKind.NodeNext,
          moduleResolution: ModuleResolutionKind.NodeNext,
          outDir: join(prefix, library),
        },
        include,
      },
      umd: {
        compilerOptions: {
          module: ModuleKind.ESNext,
          moduleResolution: ModuleResolutionKind.Bundler,
          outDir: join(prefix, library),
        },
        include,
      },
    });
  }
}

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

function createDeclarationConfig<const Options extends ConfigOptions>(
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
        join(options.compilerOptions.outDir, file),
      emitDeclarationOnly: true,
      outDir: undefined,
    }),
  };
}

function createStandardConfig<const Options extends ConfigOptions>(
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

function writeConfig<const Options extends ConfigOptions>(
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

function writeConfigs<const OptionsMap extends Record<string, ConfigOptions>>(
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
