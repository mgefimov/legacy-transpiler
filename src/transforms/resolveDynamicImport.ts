import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { moduleExportsAccess } from './moduleExportsAccess';

export interface ResolveDynamicImportOptions {
  resolveModule: (source: string) => string;
  staticImportModule: (resolvedSource: string) => Promise<void>;
  src: string;
}

export async function transformDynamicImports(ast: acorn.Program, options: ResolveDynamicImportOptions): Promise<void> {
  // Collect AwaitExpressions wrapping ImportExpressions so we can unwrap them
  const awaitImports = new Set<acorn.Node>();
  walk.simple(ast, {
    AwaitExpression(node: acorn.AwaitExpression) {
      if ((node as any).argument?.type === 'ImportExpression') {
        awaitImports.add(node);
      }
    },
  } as walk.SimpleVisitors<unknown>);

  // Collect all dynamic import nodes
  const allImports: acorn.ImportExpression[] = [];
  walk.simple(ast, {
    ImportExpression(node: acorn.ImportExpression) {
      allImports.push(node);
    },
  } as walk.SimpleVisitors<unknown>);

  if (allImports.length === 0) return;

  // Filter out non-literal sources (e.g. import(variable), import(`template`))
  const literalImports = allImports.filter((node) => {
    const isLiteral = node.source.type === 'Literal' && typeof (node.source as acorn.Literal).value === 'string';
    if (!isLiteral) {
      console.warn(`[resolveDynamicImport] skipping non-literal import(${node.source.type}) in ${options.src}`);
    }
    return isLiteral;
  });

  const dynamicImports = allImports.filter((node) => !literalImports.includes(node));

  const resolved = await Promise.all(
    literalImports.map(async (node) => {
      const source = String((node.source as acorn.Literal).value);
      const resolvedSource = options.resolveModule(source);
      await options.staticImportModule(source);
      return resolvedSource;
    })
  );

  for (let i = 0; i < literalImports.length; i++) {
    const node = literalImports[i];
    const resolvedSource: acorn.Literal = {
      ...(node.source as acorn.Literal),
      value: resolved[i],
      raw: undefined,
    };
    const replacement = moduleExportsAccess(resolvedSource, node.start, node.end);
    mutateNode(node, replacement);
  }

  // Wrap non-literal dynamic imports with window.LegacyTranspiler._import()
  // Resolution is delegated to _resolveModule at runtime
  for (const node of dynamicImports) {
    const replacement = dynamicImportCall(node.source, node.start, node.end);
    mutateNode(node, replacement);
  }

  // Unwrap await only for literal imports converted to synchronous module access
  const convertedNodes = new Set<acorn.Node>(literalImports);
  for (const awaitNode of awaitImports) {
    if (convertedNodes.has((awaitNode as any).argument)) {
      mutateNode(awaitNode, (awaitNode as any).argument);
    }
  }
}

/**
 * Build AST for: window.LegacyTranspiler._import(source)
 */
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
      property: { type: 'Identifier', name: '_import', start, end },
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
