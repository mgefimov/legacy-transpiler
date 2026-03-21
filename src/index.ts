import { staticImportToDynamic, wrapAsyncIIFE } from './transforms';
import type { StaticImportToDynamicOptions } from './transforms/staticImportToDynamic';

export { staticImportToDynamic, wrapAsyncIIFE };
export type { StaticImportToDynamicOptions };

export interface TranspileOptions {
  resolveModule?: StaticImportToDynamicOptions['resolveModule'];
  minify?: boolean;
}

export function transpile(code: string, options?: TranspileOptions): string {
  const dynamicImports = staticImportToDynamic(code, { resolveModule: options?.resolveModule });
  return wrapAsyncIIFE(dynamicImports, { minify: options?.minify });
}
