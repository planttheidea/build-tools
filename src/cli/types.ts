import { readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';

export function renameModuleExtensions(type: 'cjs' | 'es', library = 'dist') {
  const extension =
    type === 'cjs' ? '.d.cts' : type === 'es' ? '.d.mts' : undefined;

  if (!extension) {
    throw new ReferenceError(
      `Type "${type}" is invalid; please pass either "cjs" or "es".`,
    );
  }

  const root = gitRoot();
  const typesDir = join(root, library, type);
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
