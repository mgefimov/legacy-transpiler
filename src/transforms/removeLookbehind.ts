import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { generate } from 'astring';

const LOOKBEHIND_RE = /\(\?<[=!]([^()]*(?:\([^()]*\))*[^()]*)\)/g;

export function removeLookbehind(code: string): string {
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });

  walk.simple(ast, {
    Literal(node: acorn.Literal) {
      if (node.regex) {
        node.regex.pattern = node.regex.pattern.replace(LOOKBEHIND_RE, '');
        node.raw = `/${node.regex.pattern}/${node.regex.flags}`;
      }
    },
  });

  return generate(ast);
}
