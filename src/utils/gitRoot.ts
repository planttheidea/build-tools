import { resolve } from 'node:path';
import { execaSync } from 'execa';

export function gitRoot(cwd: string = process.cwd()): string {
  try {
    const { stdout } = execaSync('git', ['rev-parse', '--show-toplevel'], { cwd: resolve(cwd) });

    return stdout;
  } catch {
    return '';
  }
}
