import * as acorn from 'acorn';
import { generate } from 'astring';

export function removeExport(code: string): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  ast.body = ast.body.flatMap((node): (acorn.Statement | acorn.ModuleDeclaration)[] => {
    // export const foo = 1 → const foo = 1
    // export function foo() {} → function foo() {}
    // export class Foo {} → class Foo {}
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      return [node.declaration];
    }

    // export { foo, bar } → remove
    if (node.type === 'ExportNamedDeclaration' && !node.declaration) {
      return [];
    }

    // export default expr → remove
    if (node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration;
      // export default function foo() {} → function foo() {} (only if named)
      if (decl.type === 'FunctionDeclaration' && decl.id) {
        return [decl as acorn.FunctionDeclaration];
      }
      // export default class Foo {} → class Foo {} (only if named)
      if (decl.type === 'ClassDeclaration' && decl.id) {
        return [decl as acorn.ClassDeclaration];
      }
      // export default expr / anonymous → remove
      return [];
    }

    // export * from './module' → remove
    if (node.type === 'ExportAllDeclaration') {
      return [];
    }

    return [node];
  });

  return generate(ast);
}
