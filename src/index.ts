import { staticImportToDynamic } from './transforms';

export { staticImportToDynamic };

export function transpile(code: string): string {
  return staticImportToDynamic(code);
}
