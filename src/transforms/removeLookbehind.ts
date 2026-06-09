import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const LOOKBEHIND_RE = /\(\?<[=!]([^()]*(?:\([^()]*\))*[^()]*)\)/g;

// The first argument to RegExp(...) is the pattern; its source is the same regex
// text we strip in a literal, so reuse LOOKBEHIND_RE on it. String-literal patterns
// are stripped directly. Template-literal patterns are stripped per static quasi
// (e.g. `(?<!x)(${name})...`) — a lookbehind that spans an interpolation, or one
// produced at runtime by an interpolated value, can't be handled statically and is
// left as-is. Patterns built from variables are likewise left untouched.
function stripStringPattern(args: Array<acorn.Expression | acorn.SpreadElement>): void {
  const pattern = args[0];
  if (!pattern) return;
  if (pattern.type === 'Literal' && typeof pattern.value === 'string') {
    const stripped = pattern.value.replace(LOOKBEHIND_RE, '');
    if (stripped === pattern.value) return;
    pattern.value = stripped;
    pattern.raw = JSON.stringify(stripped);
    return;
  }
  if (pattern.type === 'TemplateLiteral') {
    for (const quasi of pattern.quasis) {
      quasi.value.raw = quasi.value.raw.replace(LOOKBEHIND_RE, '');
      if (quasi.value.cooked != null) {
        quasi.value.cooked = quasi.value.cooked.replace(LOOKBEHIND_RE, '');
      }
    }
  }
}

function isRegExpCallee(callee: acorn.Expression | acorn.Super): boolean {
  return callee.type === 'Identifier' && callee.name === 'RegExp';
}

export const createLookbehindVisitor = (): walk.SimpleVisitors<unknown> => {
  return {
    Literal(node: acorn.Literal) {
      if (node.regex) {
        node.regex.pattern = node.regex.pattern.replace(LOOKBEHIND_RE, '');
        node.raw = `/${node.regex.pattern}/${node.regex.flags}`;
      }
    },
    CallExpression(node: acorn.CallExpression) {
      if (isRegExpCallee(node.callee)) stripStringPattern(node.arguments);
    },
    NewExpression(node: acorn.NewExpression) {
      if (isRegExpCallee(node.callee)) stripStringPattern(node.arguments);
    }
  }
};
