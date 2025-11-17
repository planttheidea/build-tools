import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';

export interface ViteArgs {
  config: string;
  development: string;
}

export function createViteConfig({ config, development }: ViteArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    mkdirSync(configDir);
  }

  const content = `
import { createViteConfig } from '@planttheidea/build-tools';

export default createViteConfig({
    development: '${development}',
});
`.trim();

  writeFileSync(join(configDir, 'vite.config.ts'), content, 'utf8');
}
