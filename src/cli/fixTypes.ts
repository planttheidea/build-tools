import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import fastGlob from 'fast-glob';
import gitRoot from 'git-root';
import { format } from '../utils/format.js';

const { glob } = fastGlob;

export interface FixTypesArgs {
  library: string;
}

const TYPES = [
  { extension: '.d.cts', type: 'cjs' },
  { extension: '.d.mts', type: 'es' },
] as const;

export async function fixTypes({ library }: FixTypesArgs) {
  const root = gitRoot();

  await Promise.all(
    TYPES.flatMap(async ({ extension, type }) => {
      const typesDir = join(root, library, type);
      const files = await glob(join(typesDir, '*.d.ts'), { absolute: true });

      return files.map(async (file) => {
        const content = await readFile(file, 'utf8');
        const updatedContent = content
          .replaceAll(".ts';", `${extension}';`)
          .replaceAll(".js';", `${extension}';`)
          .replaceAll('import {', 'import type {');
        const formattedContent = await format(updatedContent);

        await Promise.all([rm(file), writeFile(file.replace('.d.ts', extension), formattedContent, 'utf8')]);
      });
    }),
  );

  const legacyFile = join(root, 'index.d.ts');
  const legacyFileContent = await readFile(legacyFile, 'utf8');
  const formattedLegacyFile = await format(legacyFileContent);

  await writeFile(legacyFile, formattedLegacyFile, 'utf8');
}
