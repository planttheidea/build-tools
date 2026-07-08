import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { StandardConfigOptions } from '../internalTypes.js';
import { format } from '../utils/format.js';
import { gitRoot } from '../utils/gitRoot.js';

export interface RollupArgs extends Pick<StandardConfigOptions, 'cjs' | 'config' | 'source' | 'sourceMap' | 'umd'> {}

export async function createRollupConfigs({ cjs, config, source, sourceMap, umd }: RollupArgs) {
  const root = gitRoot();
  const configDir = join(root, config);

  if (!existsSync(configDir)) {
    await mkdir(configDir);
  }

  const content = await format(`
    import { createRollupConfig } from '@planttheidea/build-tools';

    export default createRollupConfig({
      cjs: ${String(cjs)},
      config: '${config}',
      source: '${source}',
      sourceMap: ${String(sourceMap)},
      umd: ${String(umd)},
    });
  `);

  await writeFile(join(configDir, 'rollup.config.js'), content, 'utf8');
}
