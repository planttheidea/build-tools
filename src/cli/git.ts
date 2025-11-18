import { copyFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';

export interface GitArgs {}

export async function createGitFiles(_args: GitArgs) {
  const root = gitRoot();
  const templateDir = resolve(import.meta.dirname, '..', '..', 'templates', 'git');

  await Promise.all([
    copyFile(join(templateDir, '.gitignore'), join(root, '.gitignore')),
    copyFile(join(templateDir, 'LICENSE'), join(root, 'LICENSE')),
  ]);
}
