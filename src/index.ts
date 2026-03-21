import { functionToArrow } from './transforms/functionToArrow';

export { functionToArrow };

export function transpile(code: string): string {
  return functionToArrow(code);
}
