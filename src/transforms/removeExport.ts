import * as acorn from 'acorn';

export interface RemoveExportOptions {
  src: string;
}

export function transformExports(ast: acorn.Program, options: RemoveExportOptions): void {
  const exports: { key: string; value: string }[] = [];

  ast.body = ast.body.flatMap((node): (acorn.Statement | acorn.ModuleDeclaration)[] => {
    // export const foo = 1 → const foo = 1
    // export function foo() {} → function foo() {}
    // export class Foo {} → class Foo {}
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      const decl = node.declaration;
      if (decl.type === 'VariableDeclaration') {
        for (const d of decl.declarations) {
          if (d.id.type === 'Identifier') {
            exports.push({ key: d.id.name, value: d.id.name });
          }
        }
      } else if (decl.type === 'FunctionDeclaration' && decl.id) {
        exports.push({ key: decl.id.name, value: decl.id.name });
      } else if (decl.type === 'ClassDeclaration' && decl.id) {
        exports.push({ key: decl.id.name, value: decl.id.name });
      }
      return [decl];
    }

    // export { foo, bar } / export { foo as bar }
    if (node.type === 'ExportNamedDeclaration' && !node.declaration) {
      for (const spec of node.specifiers) {
        const exported = spec.exported;
        const exportedName = exported.type === 'Identifier' ? exported.name : String(exported.value);
        const localName = spec.local.type === 'Identifier' ? spec.local.name : String(spec.local.value);
        exports.push({ key: exportedName, value: localName });
      }
      return [];
    }

    // export default
    if (node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration;
      if (decl.type === 'FunctionDeclaration' && decl.id) {
        exports.push({ key: 'default', value: decl.id.name });
        return [decl as acorn.FunctionDeclaration];
      }
      if (decl.type === 'ClassDeclaration' && decl.id) {
        exports.push({ key: 'default', value: decl.id.name });
        return [decl as acorn.ClassDeclaration];
      }
      // export default <expr> → var __default = <expr>
      const tempId: acorn.Identifier = { type: 'Identifier', name: '__default', start: decl.start, end: decl.end };
      const tempDecl: acorn.VariableDeclaration = {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [{
          type: 'VariableDeclarator',
          id: tempId,
          init: decl as acorn.Expression,
          start: decl.start,
          end: decl.end,
        }],
        start: node.start,
        end: node.end,
      };
      exports.push({ key: 'default', value: '__default' });
      return [tempDecl];
    }

    // export * from './module' → remove
    if (node.type === 'ExportAllDeclaration') {
      return [];
    }

    return [node];
  });

  // Append: window.LegacyTranspiler._moduleExports[src] = { ... }
  if (exports.length > 0) {
    const props: acorn.Property[] = exports.map((e) => {
      const key: acorn.Identifier = { type: 'Identifier', name: e.key, start: 0, end: 0 };
      const value: acorn.Identifier = { type: 'Identifier', name: e.value, start: 0, end: 0 };
      return {
        type: 'Property',
        key,
        value,
        kind: 'init' as const,
        computed: false,
        method: false,
        shorthand: e.key === e.value,
        start: 0,
        end: 0,
      };
    });

    // window.LegacyTranspiler._moduleExports[src]
    const assignTarget: acorn.MemberExpression = {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window', start: 0, end: 0 },
          property: { type: 'Identifier', name: 'LegacyTranspiler', start: 0, end: 0 },
          computed: false,
          optional: false,
          start: 0,
          end: 0,
        },
        property: { type: 'Identifier', name: '_moduleExports', start: 0, end: 0 },
        computed: false,
        optional: false,
        start: 0,
        end: 0,
      },
      property: { type: 'Literal', value: options.src, start: 0, end: 0 },
      computed: true,
      optional: false,
      start: 0,
      end: 0,
    };

    const assignment: acorn.ExpressionStatement = {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: assignTarget as unknown as acorn.Pattern,
        right: { type: 'ObjectExpression', properties: props, start: 0, end: 0 },
        start: 0,
        end: 0,
      },
      start: 0,
      end: 0,
    };

    ast.body.push(assignment);
  }
}

