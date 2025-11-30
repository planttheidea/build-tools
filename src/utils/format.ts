import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Config } from 'prettier';

export async function format(source: string, parser: 'json' | 'typescript' = 'typescript') {
  let optionsContent: string;

  try {
    // In case there are manual overrides in the existing file, use that.
    optionsContent = await readFile(resolve(import.meta.dirname, '..', '..', '.prettierrc'), 'utf8');
  } catch {
    // If no existing file, use the template as it contains all defaults.
    optionsContent = await readFile(
      resolve(import.meta.dirname, '..', '..', 'templates', 'prettier', '.prettierrc'),
      'utf8',
    );
  }

  const options = JSON.parse(optionsContent) as Config;

  // Inline the import to allow this file to be safely imported statically in other CLI files prior to install.
  const { format } = await import('prettier');

  return await format(source, { ...options, parser });
}
