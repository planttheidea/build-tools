#!/usr/bin/env node

import { runPtiCommand } from '../dist/cli/index.js';

runPtiCommand(process.argv.slice(2));
