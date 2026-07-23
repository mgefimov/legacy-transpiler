import * as acorn from 'acorn';

/**
 * Build AST for: window.LegacyTranspiler.<method>(...args)
 */
function legacyCall(method: string, args: acorn.Expression[], start: number, end: number): acorn.CallExpression {
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
      property: { type: 'Identifier', name: method, start, end },
      computed: false,
      optional: false,
      start,
      end,
    },
    arguments: args,
    optional: false,
    start,
    end,
  };
}

/**
 * Build AST for: window.LegacyTranspiler.importModule(source[, importer])
 *
 * `importer` (the importing module's own resolved src) lets the runtime detect
 * circular imports — without it, a module cycle deadlocks (see moduleCycle.test.ts).
 */
export function moduleExportsAccess(source: acorn.Expression, start: number, end: number, importer?: string): acorn.CallExpression {
  const args: acorn.Expression[] = [source];
  if (importer !== undefined) {
    args.push({ type: 'Literal', value: importer, start, end });
  }
  return legacyCall('importModule', args, start, end);
}

/**
 * Build AST for: window.LegacyTranspiler.getModuleExports(source)
 */
export function moduleGetExportsAccess(source: acorn.Expression, start: number, end: number): acorn.CallExpression {
  return legacyCall('getModuleExports', [source], start, end);
}

/**
 * Build AST for: window.LegacyTranspiler.onExportsUpdated(source, callback)
 */
export function onExportsUpdatedAccess(source: acorn.Expression, callback: acorn.Expression, start: number, end: number): acorn.CallExpression {
  return legacyCall('onExportsUpdated', [source, callback], start, end);
}
