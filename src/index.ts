import { staticImportToDynamic, wrapAsyncIIFE } from './transforms';

export { staticImportToDynamic, wrapAsyncIIFE };

export function transpile(code: string): string {
  const dynamicImports = staticImportToDynamic(code);
  return wrapAsyncIIFE(dynamicImports);
}
