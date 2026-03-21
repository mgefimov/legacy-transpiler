import { staticImportToDynamic, replaceImportMeta, removeLookbehind, wrapAsyncIIFE } from './transforms';
import type { StaticImportToDynamicOptions } from './transforms/staticImportToDynamic';

export { staticImportToDynamic, replaceImportMeta, removeLookbehind, wrapAsyncIIFE };
export type { StaticImportToDynamicOptions };

export interface TranspileOptions {
  resolveModule?: StaticImportToDynamicOptions['resolveModule'];
  importMetaUrl?: string;
  minify?: boolean;
}

export function transpile(code: string, options?: TranspileOptions): string {
  let result = staticImportToDynamic(code, { resolveModule: options?.resolveModule });
  result = replaceImportMeta(result, { url: options?.importMetaUrl });
  result = removeLookbehind(result);
  return wrapAsyncIIFE(result, { minify: options?.minify });
}
