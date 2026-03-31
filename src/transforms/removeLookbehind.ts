import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const LOOKBEHIND_RE = /\(\?<[=!]([^()]*(?:\([^()]*\))*[^()]*)\)/g;

export const createLookbehindVisitor = (): walk.SimpleVisitors<unknown> => {
  return {
    Literal(node: acorn.Literal) {
      if (node.regex) {
        node.regex.pattern = node.regex.pattern.replace(LOOKBEHIND_RE, '');
        node.raw = `/${node.regex.pattern}/${node.regex.flags}`;
      }
    }
  }
};

