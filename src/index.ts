import { staticImportToDynamic, replaceImportMeta, removeLookbehind, removeExport, transformStaticBlock, wrapAsyncIIFE } from './transforms';
import type { StaticImportToDynamicOptions } from './transforms/staticImportToDynamic';

export { staticImportToDynamic, replaceImportMeta, removeLookbehind, removeExport, transformStaticBlock, wrapAsyncIIFE };
export type { StaticImportToDynamicOptions };

export interface TranspileOptions {
  src: string;
  resolveModule: StaticImportToDynamicOptions['resolveModule'];
  minify?: boolean;
}

export async function transpile(code: string, options: TranspileOptions): Promise<string> {
  let result = await staticImportToDynamic(code, { resolveModule: options.resolveModule });
  result = replaceImportMeta(result, { url: options.src });
  result = removeExport(result, { src: options.src });
  result = removeLookbehind(result);
  result = transformStaticBlock(result);
  return wrapAsyncIIFE(result, { minify: options.minify });
}
