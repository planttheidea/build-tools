#!/usr/bin/env node

import { createVitestConfig } from '../dist/cli/vitest.js';

createVitestConfig(process.argv.slice(2));
