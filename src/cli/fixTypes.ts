import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import fastGlob from 'fast-glob';
import gitRoot from 'git-root';

const { globSync } = fastGlob;

export interface FixTypesArgs {
  library: string;
  type: 'cjs' | 'es';
}

export function fixTypes({ library, type }: FixTypesArgs) {
  const extension =
    type === 'cjs'
      ? '.d.cts'
      : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        type === 'es'
        ? '.d.mts'
        : undefined;

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
