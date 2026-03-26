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
  transformVarDeclarations,
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
  transformVarDeclarations,
};
export type { StaticImportToDynamicOptions };

export let _baseURL = '';

// export function _resolveDynamicModule(source: string): string {
//   console.log('[_resolveDynamicModule]', source);
//   if (!_baseURL) return source;
//   return `${_baseURL}/${source.replace(/^\.\//, '')}`;
// }

// export function _import(source: string): Promise<any> {
//   const resolved = window.LegacyTranspiler._resolveDynamicModule(source);
//   console.log('[dynamic-import]', resolved);
//   return import(resolved);
// }

export interface TranspileOptions {
  src: string;
  resolveModule: StaticImportToDynamicOptions['resolveModule'];
  staticImportModule: StaticImportToDynamicOptions['staticImportModule'];
  minify?: boolean;
}

export async function transpile(code: string, options: TranspileOptions): Promise<string> {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowAwaitOutsideFunction: true,
  });

  await transformStaticImports(ast, {
    resolveModule: options.resolveModule,
    staticImportModule: options.staticImportModule
  });
  await transformDynamicImports(ast, {
    resolveModule: options.resolveModule,
    staticImportModule: options.staticImportModule,
    src: options.src
  });
  transformImportMeta(ast, { url: options.src });
  transformExports(ast, { src: options.src });
  transformLookbehind(ast);
  transformStaticBlocks(ast);
  transformVarDeclarations(ast);

  return generate(ast, options.minify ? { indent: '', lineEnd: '' } : undefined);
}
