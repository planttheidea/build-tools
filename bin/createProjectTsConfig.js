#!/usr/bin/env node

import { createProjectTsConfigs } from '../dist/cli/tsconfig';

createProjectTsConfigs(process.argv);
