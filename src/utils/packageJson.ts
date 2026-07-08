import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PackageJson } from '../internalTypes.js';
import { gitRoot } from './gitRoot.js';

export function getPackageJson(root: string = gitRoot()): PackageJson {
  const path = resolve(root, 'package.json');

  if (!existsSync(path)) {
    throw new ReferenceError('No `package.json` found');
  }

  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}
