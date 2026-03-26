import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export function transformVarDeclarations(ast: acorn.Program): void {
  walk.simple(ast, {
    VariableDeclaration(node: acorn.VariableDeclaration) {
      if (node.kind === 'let' || node.kind === 'const') {
        (node as any).kind = 'var';
      }
    },
  } as walk.SimpleVisitors<unknown>);
}
