#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import gitRoot from 'git-root';
import { createConfigs } from '../dist/tsconfig.js';

const ROOT = gitRoot();

const config = createConfigs({
  includes: ['./src/**/*'],
});

writeFileSync(
  join(ROOT, 'tsconfig.json'),
  JSON.stringify(config.runtime, null, 2),
  'utf8',
);
