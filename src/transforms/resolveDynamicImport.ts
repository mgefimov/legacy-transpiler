import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { moduleExportsAccess } from './moduleExportsAccess';

export const createDynamicImportsVisitor = (): walk.SimpleVisitors<unknown> => {
  return {
    ImportExpression(node: acorn.ImportExpression) {
      const isLiteral = node.source.type === 'Literal' && typeof (node.source as acorn.Literal).value === 'string';

      if (isLiteral) {
        const resolvedSource: acorn.Literal = {
          ...(node.source as acorn.Literal),
          value: String((node.source as acorn.Literal).value),
          raw: undefined,
        };
        mutateNode(node, moduleExportsAccess(resolvedSource, node.start, node.end));
      } else {
        console.warn(`[resolveDynamicImport] skipping non-literal import(${node.source.type})`);
        mutateNode(node, dynamicImportCall(node.source, node.start, node.end));
      }
    }
  }
};

function dynamicImportCall(source: any, start: number, end: number): any {
  return {
    type: 'CallExpression',
    callee: {
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
      property: { type: 'Identifier', name: 'importModule', start, end },
      computed: false,
      optional: false,
      start,
      end,
    },
    arguments: [source],
    optional: false,
    start,
    end,
  };
}

function mutateNode(target: any, replacement: any): void {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, replacement);
}
