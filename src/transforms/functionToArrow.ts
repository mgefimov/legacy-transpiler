import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { generate } from 'astring';

export function functionToArrow(code: string): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  walk.simple(ast, {
    FunctionExpression(node: any) {
      node.type = 'ArrowFunctionExpression';

      // Single return statement → concise expression body
      if (
        node.body.type === 'BlockStatement' &&
        node.body.body.length === 1 &&
        node.body.body[0].type === 'ReturnStatement' &&
        node.body.body[0].argument
      ) {
        node.body = node.body.body[0].argument;
        node.expression = true;
      } else {
        node.expression = false;
      }
    },
  });

  return generate(ast);
}
