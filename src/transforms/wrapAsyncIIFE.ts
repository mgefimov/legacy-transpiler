import * as acorn from 'acorn';

export interface WrapAsyncIIFEOptions {
  minify?: boolean;
}

export function transformWrapAsyncIIFE(ast: acorn.Program): void {
  const asyncFunc: acorn.FunctionExpression = {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: {
      type: 'BlockStatement',
      body: ast.body as acorn.Statement[],
      start: ast.start,
      end: ast.end,
    },
    generator: false,
    expression: false,
    async: true,
    start: ast.start,
    end: ast.end,
  };

  const callExpr: acorn.CallExpression = {
    type: 'CallExpression',
    callee: asyncFunc,
    arguments: [],
    optional: false,
    start: ast.start,
    end: ast.end,
  };

  ast.body = [{
    type: 'ExpressionStatement',
    expression: callExpr,
    start: ast.start,
    end: ast.end,
  }];
}

