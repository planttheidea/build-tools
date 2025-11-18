import { copyFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';

export interface PrettierArgs {}

export async function createPrettierConfig(_args: PrettierArgs) {
  const root = gitRoot();
  const templatesDir = resolve(import.meta.dirname, '..', '..', 'templates', 'prettier');

  await copyFile(join(templatesDir, '.prettierrc'), join(root, '.prettierrc'));
}
