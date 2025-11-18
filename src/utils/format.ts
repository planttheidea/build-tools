import * as prettier from 'prettier';

export async function format(source: string, parser: 'json' | 'typescript' = 'typescript') {
  return await prettier.format(source, { parser });
}
