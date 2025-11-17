#!/usr/bin/env node

import { createTsConfigs } from '../dist/cli/tsconfig.js';

createTsConfigs(process.argv.slice(2));
