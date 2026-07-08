import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execa } from 'execa';

export interface TempProject {
  cleanup: () => Promise<void>;
  root: string;
}

export async function createTempProject(): Promise<TempProject> {
  const root = await mkdtemp(join(tmpdir(), 'pti-build-tools-'));

  await execa('git', ['init'], { cwd: root });

  return {
    root,
    cleanup: () => rm(root, { force: true, recursive: true }),
  };
}
