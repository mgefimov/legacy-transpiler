import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { generate } from 'astring';
import { moduleExportsAccess } from './moduleExportsAccess';

export interface ResolveDynamicImportOptions {
  resolveModule: (source: string) => string | Promise<string>;
  src: string;
}

export async function resolveDynamicImport(code: string, options: ResolveDynamicImportOptions): Promise<string> {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

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
  const dynamicImports: acorn.ImportExpression[] = [];
  walk.simple(ast, {
    ImportExpression(node: acorn.ImportExpression) {
      dynamicImports.push(node);
    },
  } as walk.SimpleVisitors<unknown>);

  if (dynamicImports.length === 0) return code;

  // Filter out non-literal sources (e.g. import(variable), import(`template`))
  const literalImports = dynamicImports.filter((node) => {
    const isLiteral = node.source.type === 'Literal' && typeof (node.source as acorn.Literal).value === 'string';
    if (!isLiteral) {
      console.warn(`[resolveDynamicImport] skipping non-literal import source: ${code.slice(node.start, node.end)}. File: ${options.src}`);
    }
    return isLiteral;
  });

  if (literalImports.length === 0) return code;

  const resolved = await Promise.all(
    literalImports.map((node) => options.resolveModule(String((node.source as acorn.Literal).value)))
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

  // Unwrap await: mutate AwaitExpression to become its (now-replaced) argument
  for (const awaitNode of awaitImports) {
    mutateNode(awaitNode, (awaitNode as any).argument);
  }

  return generate(ast);
}

function mutateNode(target: any, replacement: any): void {
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, replacement);
}
