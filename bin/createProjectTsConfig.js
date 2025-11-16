#!/usr/bin/env node

import { createProjectTsConfigs } from '../dist/cli/tsconfig.js';

createProjectTsConfigs(process.argv);
