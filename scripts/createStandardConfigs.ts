import { join, resolve } from 'node:path';
import { createConfig, writeConfig } from '../tsconfig/createConfig';

const DESTINATION_FOLDER = resolve('..', 'tsconfig');

writeConfig(join(DESTINATION_FOLDER, 'base.json'), createConfig({}));
writeConfig(
  join(DESTINATION_FOLDER, 'base.declarations.json'),
  createConfig({
    compilerOptions: {
      declaration: true,
      emitDeclarationOnly: true,
    },
  }),
);
