#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';
import type { CompilerOptions } from 'typescript';
import {
  ModuleDetectionKind,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';
import yargs from 'yargs';

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
  config?: string;
  development?: string;
  dry?: boolean;
  library?: string;
  react?: boolean;
  source?: string;
}

interface IncludeArgs
  extends Pick<Args, 'config' | 'development' | 'react' | 'source'> {
  prefix?: string;
}

function getInclude({
  config,
  development,
  react,
  source,
  prefix = '.',
}: IncludeArgs) {
  const files = [config, development, source].filter(
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

export function createTsConfigs(argv: string[]) {
  const { config, development, dry, library, react, source } = yargs(argv)
    .option('config', {
      alias: 'b',
      default: 'config',
      description: 'Location of configuration files',
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

  if (!dry) {
    /** WRITE FILES **/

    const root = gitRoot();
    const sourceDir = join(root, source);

    if (!existsSync(sourceDir)) {
      mkdirSync(sourceDir);
    }

    if (!existsSync(join(sourceDir, 'index.ts'))) {
      writeFileSync(
        join(sourceDir, 'index.ts'),
        'export const REPLACE_ME = {};',
        'utf8',
      );
    }

    const configDir = join(root, config);

    if (!existsSync(configDir)) {
      mkdirSync(configDir);
    }

    const configTypes = join(configDir, 'types');

    if (!existsSync(configTypes)) {
      mkdirSync(configTypes);
    }

    const baseConfig = getStandardConfig({
      compilerOptions: {
        baseUrl: source,
        jsx: react ? 'react-jsx' : undefined,
        outDir: library,
        types: react ? ['node', 'react'] : ['node'],
      },
      exclude: ['**/node_modules/**', `${library}/**/*`],
      include: getInclude({ config, development, source }),
    });

    writeFileSync(
      join(root, 'tsconfig.json'),
      JSON.stringify(baseConfig, null, 2),
      'utf8',
    );

    const prefix = join('..', '..');
    const include = getInclude({ source, prefix });

    writeConfigs(resolve(configTypes), {
      cjs: {
        compilerOptions: {
          module: ModuleKind.Node16,
          moduleResolution: ModuleResolutionKind.Node16,
          outDir: join(prefix, library, 'cjs'),
        },
        include,
      },
      es: {
        compilerOptions: {
          module: ModuleKind.NodeNext,
          moduleResolution: ModuleResolutionKind.NodeNext,
          outDir: join(prefix, library, 'es'),
        },
        include,
      },
      umd: {
        compilerOptions: {
          module: ModuleKind.ESNext,
          moduleResolution: ModuleResolutionKind.Bundler,
          outDir: join(prefix, library, 'umd'),
        },
        include,
      },
    });
  }
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
      declarationDir:
        options.compilerOptions.declarationDir ??
        options.compilerOptions.outDir,
      emitDeclarationOnly: true,
      outDir: undefined,
    }),
  };
}

function getNormalizedCompilerOptions<Options extends Record<string, any>>(
  options: Options,
): Options {
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

  const runtimeConfig = getStandardConfig(options);
  const declarationConfig = getDeclarationConfig(options);

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.fromEntries(
    Object.entries(optionsMap).map(([file, options]) => [
      file,
      writeConfig(folder, file, options),
    ]),
  ) as any;
}
