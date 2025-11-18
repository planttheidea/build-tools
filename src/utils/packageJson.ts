import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import gitRoot from 'git-root';

export interface PackageJson {
  [key: string]: undefined | string | Record<string, string> | Record<string, Record<string, string>> | string[];

  author?: string;
  browser?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports: Record<string, Record<string, string>>;
  main: string;
  module?: string;
  scripts?: Record<string, string>;
  type?: string;
  types?: string;
  version: string;
}

export function getPackageJson(root: string = gitRoot()): PackageJson {
  const path = resolve(root, 'package.json');

  if (!existsSync(path)) {
    throw new ReferenceError('No `package.json` found');
  }

  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}
