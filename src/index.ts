import * as acorn from 'acorn';
import { generate } from 'astring';
import {
  transformStaticImports,
  transformDynamicImports,
  transformImportMeta,
  transformLookbehind,
  transformExports,
  transformStaticBlocks,
  transformWrapAsyncIIFE,
} from './transforms';
import type { StaticImportToDynamicOptions } from './transforms/staticImportToDynamic';

export {
  transformStaticImports,
  transformDynamicImports,
  transformImportMeta,
  transformLookbehind,
  transformExports,
  transformStaticBlocks,
  transformWrapAsyncIIFE,
};
export type { StaticImportToDynamicOptions };

export interface TranspileOptions {
  src: string;
  resolveModule: StaticImportToDynamicOptions['resolveModule'];
  minify?: boolean;
}

export async function transpile(code: string, options: TranspileOptions): Promise<string> {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
  });

  await transformStaticImports(ast, { resolveModule: options.resolveModule });
  await transformDynamicImports(ast, { resolveModule: options.resolveModule, src: options.src });
  transformImportMeta(ast, { url: options.src });
  transformExports(ast, { src: options.src });
  transformLookbehind(ast);
  transformStaticBlocks(ast);

  return generate(ast, options.minify ? { indent: '', lineEnd: '' } : undefined);
}
