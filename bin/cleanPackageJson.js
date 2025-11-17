#!/usr/bin/env node

import { createCleanPackageJson } from '../dist/cli/packageJson.js';

createCleanPackageJson(process.argv.slice(2));
