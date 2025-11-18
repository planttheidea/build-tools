import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface ViteArgs {
  config: string;
  development: string;
}

export async function createViteConfig({ config, development }: ViteArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const content = `
import { createViteConfig } from '@planttheidea/build-tools';

export default createViteConfig({
    development: '${development}',
});
`.trim();

  await writeFile(join(configDir, 'vite.config.ts'), content, 'utf8');
}
