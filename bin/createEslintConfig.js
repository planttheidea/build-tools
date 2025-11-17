#!/usr/bin/env node

import { createEslintConfig } from '../dist/cli/eslint.js';

createEslintConfig(process.argv.slice(2));
