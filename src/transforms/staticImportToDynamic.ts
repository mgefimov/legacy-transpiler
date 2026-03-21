import * as acorn from 'acorn';
import { generate } from 'astring';

export function staticImportToDynamic(code: string): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  ast.body = ast.body.map((node): acorn.Statement | acorn.ModuleDeclaration => {
    if (node.type !== 'ImportDeclaration') return node;

    const awaitImport: acorn.AwaitExpression = {
      type: 'AwaitExpression',
      argument: {
        type: 'ImportExpression',
        source: node.source,
        options: null,
        start: node.start,
        end: node.end,
      },
      start: node.start,
      end: node.end,
    };

    // Side-effect import: import 'module' → await import('module')
    if (node.specifiers.length === 0) {
      const stmt: acorn.ExpressionStatement = {
        type: 'ExpressionStatement',
        expression: awaitImport,
        start: node.start,
        end: node.end,
      };
      return stmt;
    }

    const properties: acorn.AssignmentProperty[] = [];

    for (const spec of node.specifiers) {
      if (spec.type === 'ImportNamespaceSpecifier') {
        // import * as x from 'm' → const x = await import('m')
        const decl: acorn.VariableDeclaration = {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [{
            type: 'VariableDeclarator',
            id: spec.local,
            init: awaitImport,
            start: node.start,
            end: node.end,
          }],
          start: node.start,
          end: node.end,
        };
        return decl;
      }

      if (spec.type === 'ImportDefaultSpecifier') {
        // import x from 'm' → { default: x }
        properties.push({
          type: 'Property',
          key: { type: 'Identifier', name: 'default', start: spec.start, end: spec.end },
          value: spec.local,
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false,
          start: spec.start,
          end: spec.end,
        });
      } else if (spec.type === 'ImportSpecifier') {
        // import { x } from 'm' → { x }
        // import { x as y } from 'm' → { x: y }
        const imported = spec.imported;
        const shorthand = imported.type === 'Identifier' && imported.name === spec.local.name;
        properties.push({
          type: 'Property',
          key: spec.imported,
          value: spec.local,
          kind: 'init',
          computed: false,
          method: false,
          shorthand,
          start: spec.start,
          end: spec.end,
        });
      }
    }

    const decl: acorn.VariableDeclaration = {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [{
        type: 'VariableDeclarator',
        id: {
          type: 'ObjectPattern',
          properties,
          start: node.start,
          end: node.end,
        },
        init: awaitImport,
        start: node.start,
        end: node.end,
      }],
      start: node.start,
      end: node.end,
    };
    return decl;
  });

  return generate(ast);
}
