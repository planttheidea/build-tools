import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import fastGlob from 'fast-glob';
import gitRoot from 'git-root';

const { glob } = fastGlob;

export interface FixTypesArgs {
  library: string;
  type: 'cjs' | 'es';
}

export async function fixTypes({ library, type }: FixTypesArgs) {
  const extension =
    type === 'cjs'
      ? '.d.cts'
      : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        type === 'es'
        ? '.d.mts'
        : undefined;

  if (!extension) {
    throw new ReferenceError(`Type "${type}" is invalid; please pass either "cjs" or "es".`);
  }

  const root = gitRoot();
  const typesDir = join(root, library, type);
  const files = await glob(join(typesDir, '*.d.ts'), { absolute: true });

  await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file, 'utf8');

      const updatedContent = content
        .replaceAll(".ts';", `${extension}';`)
        .replaceAll(".js';", `${extension}';`)
        .replaceAll('import {', 'import type {');

      await Promise.all([rm(file), writeFile(file.replace('.d.ts', extension), updatedContent, 'utf8')]);
    }),
  );
}
