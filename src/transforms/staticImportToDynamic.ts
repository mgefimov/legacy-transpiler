import * as acorn from 'acorn';
import { generate } from 'astring';

export interface StaticImportToDynamicOptions {
  resolveModule: (source: string) => string;
}

/**
 * Build AST for: window.LegacyTranspiler._moduleExports[source]
 */
function moduleExportsAccess(source: acorn.Literal, start: number, end: number): acorn.MemberExpression {
  return {
    type: 'MemberExpression',
    object: {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'window', start, end },
        property: { type: 'Identifier', name: 'LegacyTranspiler', start, end },
        computed: false,
        optional: false,
        start,
        end,
      },
      property: { type: 'Identifier', name: '_moduleExports', start, end },
      computed: false,
      optional: false,
      start,
      end,
    },
    property: source,
    computed: true,
    optional: false,
    start,
    end,
  };
}

export function staticImportToDynamic(code: string, options: StaticImportToDynamicOptions): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  ast.body = ast.body.flatMap((node): (acorn.Statement | acorn.ModuleDeclaration)[] => {
    if (node.type !== 'ImportDeclaration') return [node];

    // Side-effect import: import 'module' → strip
    if (node.specifiers.length === 0) return [];

    const resolvedSource: acorn.Literal = {
      ...node.source,
      value: options.resolveModule(String(node.source.value)),
      raw: undefined,
    };

    const moduleAccess = moduleExportsAccess(resolvedSource, node.start, node.end);

    const properties: acorn.AssignmentProperty[] = [];

    for (const spec of node.specifiers) {
      if (spec.type === 'ImportNamespaceSpecifier') {
        // import * as x from 'm' → const x = window.LegacyTranspiler._moduleExports[m]
        const decl: acorn.VariableDeclaration = {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [{
            type: 'VariableDeclarator',
            id: spec.local,
            init: moduleAccess,
            start: node.start,
            end: node.end,
          }],
          start: node.start,
          end: node.end,
        };
        return [decl];
      }

      if (spec.type === 'ImportDefaultSpecifier') {
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

    // const { x, y } = window.LegacyTranspiler._moduleExports[m]
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
        init: moduleAccess,
        start: node.start,
        end: node.end,
      }],
      start: node.start,
      end: node.end,
    };
    return [decl];
  });

  return generate(ast);
}
