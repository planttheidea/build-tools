#!/usr/bin/env node

import { renameModuleExtensions } from '../dist/types.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const ARGS = yargs(hideBin(process.argv))
  .option('type', {
    alias: 't',
    description: 'Location of build configuration files',
    required: true,
    type: 'string',
  })
  .option('library', {
    alias: 'l',
    default: 'dist',
    description: 'Location of library files',
    type: 'string',
  })
  .parse();

const { library, type } = ARGS;

renameModuleExtensions(type, library);
