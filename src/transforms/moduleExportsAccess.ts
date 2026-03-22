import * as acorn from 'acorn';

/**
 * Build AST for: window.LegacyTranspiler._moduleExports[source]
 */
export function moduleExportsAccess(source: acorn.Literal, start: number, end: number): acorn.MemberExpression {
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
