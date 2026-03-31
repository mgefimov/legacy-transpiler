import * as acorn from 'acorn';

/**
 * Build AST for: window.LegacyTranspiler.importModule(source)
 */
export function moduleExportsAccess(source: acorn.Expression, start: number, end: number): acorn.CallExpression {
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
