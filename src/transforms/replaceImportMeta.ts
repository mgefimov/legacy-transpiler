import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export interface ReplaceImportMetaOptions {
  url?: string;
}

// `import.meta` is only legal inside real ES modules; left as-is it makes a
// classic <script> throw "import.meta is only valid inside modules". We rewrite
// EVERY `import.meta` (not just `import.meta.url`) into a plain object literal
// `{ url: <url> }`, so `import.meta.url` keeps working and any other access
// (`import.meta.env`, bare `import.meta`, ...) is a harmless object instead of
// a syntax error.
export function createImportMetaVisitor(options?: ReplaceImportMetaOptions): walk.SimpleVisitors<unknown> {
  // ObjectExpression nodes we synthesized in place of `import.meta`. Lets the
  // MemberExpression handler collapse `import.meta.url` back to a clean string
  // literal even though acorn-walk visits the inner MetaProperty first.
  const metaReplacements = new WeakSet<object>();

  const urlExpression = (start: number, end: number): acorn.Expression => {
    if (options?.url) {
      return { type: 'Literal', value: options.url, raw: JSON.stringify(options.url), start, end };
    }
    return {
      type: 'MemberExpression',
      object: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'document', start, end },
        property: { type: 'Identifier', name: 'currentScript', start, end },
        computed: false,
        optional: false,
        start,
        end,
      },
      property: { type: 'Identifier', name: 'src', start, end },
      computed: false,
      optional: false,
      start,
      end,
    };
  };

  return {
    MetaProperty(node: acorn.MetaProperty) {
      if (node.meta.name !== 'import' || node.property.name !== 'meta') return;

      const replacement: acorn.ObjectExpression = {
        type: 'ObjectExpression',
        properties: [{
          type: 'Property',
          key: { type: 'Identifier', name: 'url', start: node.start, end: node.end },
          value: urlExpression(node.start, node.end),
          kind: 'init',
          computed: false,
          method: false,
          shorthand: false,
          start: node.start,
          end: node.end,
        }],
        start: node.start,
        end: node.end,
      };
      Object.assign(node, replacement);
      metaReplacements.add(node);
    },

    MemberExpression(node: acorn.MemberExpression) {
      // Collapse the object we just produced for `import.meta.url` back to the
      // bare url expression: `({ url: X }).url` -> `X`.
      if (
        !node.computed &&
        node.property.type === 'Identifier' &&
        node.property.name === 'url' &&
        metaReplacements.has(node.object)
      ) {
        Object.assign(node, urlExpression(node.start, node.end));
      }
    },
  };
}
