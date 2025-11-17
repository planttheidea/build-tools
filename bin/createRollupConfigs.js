#!/usr/bin/env node

import { createRollupConfigs } from '../dist/cli/rollup.js';

createRollupConfigs(process.argv.slice(2));
