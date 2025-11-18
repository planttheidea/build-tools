import { existsSync } from 'node:fs';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import gitRoot from 'git-root';
import { format } from '../utils/format.js';

export interface ViteArgs {
  config: string;
  development: string;
  react: boolean;
}

export async function createViteConfig({ config, development, react }: ViteArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const developmentDir = join(root, development);

  if (!existsSync(developmentDir)) {
    await mkdir(developmentDir);
  }

  const templatesDir = join(import.meta.dirname, '..', '..', 'templates', 'vite');

  const content = await format(`
    import { createViteConfig } from '@planttheidea/build-tools';

    export default createViteConfig({
        development: '${development}',
    });
  `);

  const entryFiles = [copyFile(join(templatesDir, 'index.html'), join(developmentDir, 'index.html'))];

  if (react) {
    entryFiles.push(
      copyFile(join(templatesDir, 'react.tsx'), join(developmentDir, 'index.tsx')),
      copyFile(join(templatesDir, 'App.tsx'), join(developmentDir, 'App.tsx')),
    );
  } else {
    entryFiles.push(copyFile(join(templatesDir, 'standard.ts'), join(developmentDir, 'index.ts')));
  }

  await Promise.all([writeFile(join(configDir, 'vite.config.ts'), content, 'utf8'), ...entryFiles]);
}
