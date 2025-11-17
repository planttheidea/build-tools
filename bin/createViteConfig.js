#!/usr/bin/env node

import { createViteConfig } from '../dist/cli/vite.js';

createViteConfig(process.argv.slice(2));
