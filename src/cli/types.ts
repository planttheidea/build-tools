import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import fastGlob from 'fast-glob';
import gitRoot from 'git-root';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { globSync } = fastGlob;

export function createRenamedModuleExtensions(argv: string[]) {
  const { library, type } = yargs(hideBin(argv))
    .option('type', {
      alias: 't',
      choices: ['cjs', 'es'] as const,
      description: 'Location of build configuration files',
      required: true,
      type: 'string',
    })
    .option('library', {
      alias: 'l',
      default: 'dist',
      description: 'Location of library files',
      type: 'string',
    })
    .parseSync();

  renameModuleExtensions(type, library);
}

function renameModuleExtensions(type: 'cjs' | 'es', library = 'dist') {
  const extension =
    type === 'cjs' ? '.d.cts' : type === 'es' ? '.d.mts' : undefined;

  if (!extension) {
    throw new ReferenceError(
      `Type "${type}" is invalid; please pass either "cjs" or "es".`,
    );
  }

  const root = gitRoot();
  const typesDir = join(root, library, type);
  const files = globSync(join(typesDir, '*.d.ts'), { absolute: true });

  files.forEach((file) => {
    const content = readFileSync(file, 'utf8');
    const updatedContent = content
      .replaceAll(".ts';", `${extension}';`)
      .replaceAll(".js';", `${extension}';`)
      .replaceAll('import {', 'import type {');
    writeFileSync(file, updatedContent, 'utf8');
    renameSync(file, file.replace('.d.ts', extension));
  });
}
