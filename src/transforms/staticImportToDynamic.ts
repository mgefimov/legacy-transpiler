import * as acorn from 'acorn';
import { moduleExportsAccess } from './moduleExportsAccess';

export interface StaticImportToDynamicOptions {
  resolveModule: (source: string) => string | Promise<string>;
}

export async function transformStaticImports(ast: acorn.Program, options: StaticImportToDynamicOptions): Promise<void> {
  // Resolve all import sources in parallel
  const importNodes = ast.body.filter(
    (node): node is acorn.ImportDeclaration => node.type === 'ImportDeclaration' && node.specifiers.length > 0
  );
  const resolved = await Promise.all(
    importNodes.map((node) => options.resolveModule(String(node.source.value)))
  );
  const resolvedMap = new Map<acorn.ImportDeclaration, string>();
  importNodes.forEach((node, i) => resolvedMap.set(node, resolved[i]));

  ast.body = ast.body.flatMap((node): (acorn.Statement | acorn.ModuleDeclaration)[] => {
    if (node.type !== 'ImportDeclaration') return [node];

    // Side-effect import: import 'module' → strip
    if (node.specifiers.length === 0) return [];

    const resolvedSource: acorn.Literal = {
      ...node.source,
      value: resolvedMap.get(node)!,
      raw: undefined,
    };

    const moduleAccess = moduleExportsAccess(resolvedSource, node.start, node.end);

    const properties: acorn.AssignmentProperty[] = [];

    for (const spec of node.specifiers) {
      if (spec.type === 'ImportNamespaceSpecifier') {
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
}

