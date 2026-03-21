import * as acorn from 'acorn';
import { generate } from 'astring';

export function wrapAsyncIIFE(code: string): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'script',
    allowAwaitOutsideFunction: true,
  });

  const program = ast as acorn.Program;

  const asyncFunc: acorn.FunctionExpression = {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: {
      type: 'BlockStatement',
      body: program.body as acorn.Statement[],
      start: program.start,
      end: program.end,
    },
    generator: false,
    expression: false,
    async: true,
    start: program.start,
    end: program.end,
  };

  const callExpr: acorn.CallExpression = {
    type: 'CallExpression',
    callee: asyncFunc,
    arguments: [],
    optional: false,
    start: program.start,
    end: program.end,
  };

  program.body = [{
    type: 'ExpressionStatement',
    expression: callExpr,
    start: program.start,
    end: program.end,
  }];

  return generate(ast);
}
