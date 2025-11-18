import { copyFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import gitRoot from 'git-root';

export interface YarnArgs {}

export async function createYarnFiles(_args: YarnArgs) {
  const root = gitRoot();
  const templateDir = resolve(import.meta.dirname, '..', '..', 'templates', 'yarn');

  await copyFile(join(templateDir, '.yarnrc.yml'), join(root, '.yarnrc.yml'));
}
