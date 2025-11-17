#!/usr/bin/env node

import { createReleaseItConfigs } from '../dist/cli/releaseIt.js';

createReleaseItConfigs(process.argv.slice(2));
